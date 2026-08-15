"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Copy, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QRCode from "qrcode"
import ReactMarkdown from "react-markdown"

import { generateCertificateHTML } from "@/lib/certificate-template" // your new template
import { preloadFonts } from "@/lib/fonts"

interface CertificateDetailsProps {
  certificate: {
    cert_code: string
    holder_name: string
    issued_at: string
    expires_at: string | null
    status: "VALID" | "EXPIRED" | "REVOKED"
    achievements_markdown: string
    signature_hash: string | null
    programName: string
    programSlug: string
  }
}

const statusConfig = {
  VALID: {
    color: "bg-[#14F195]",
    text: "text-[#14F195]",
    icon: CheckCircle2,
    label: "Valid Certificate",
    border: "border-[#14F195]/50",
  },
  EXPIRED: {
    color: "bg-[#FFC857]",
    text: "text-[#FFC857]",
    icon: Clock,
    label: "Expired",
    border: "border-[#FFC857]/50",
  },
  REVOKED: {
    color: "bg-[#FF4B4B]",
    text: "text-[#FF4B4B]",
    icon: XCircle,
    label: "Revoked",
    border: "border-[#FF4B4B]/50",
  },
}

export function CertificateDetailsClient({ certificate }: CertificateDetailsProps) {
  const { toast } = useToast()
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [downloading, setDownloading] = useState<"png" | "pdf" | null>(null)
  const canvasCacheRef = useRef<HTMLCanvasElement | null>(null)

  const config = statusConfig[certificate.status]
  const StatusIcon = config.icon

  // ---------------------------
  //  Generate Verification QR
  // ---------------------------
  useEffect(() => {
    const generateQR = async () => {
      try {
        const verifyUrl = `${window.location.origin}/c/${certificate.cert_code}`
        const dataUrl = await QRCode.toDataURL(verifyUrl, {
          width: 256,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#12E8D5", light: "#0B0C10" },
        })
        setQrDataUrl(dataUrl)
      } catch (e) {
        console.error("QR generation failed", e)
        toast({ title: "QR error", description: "Could not generate QR code.", variant: "destructive" })
      }
    }
    generateQR()
  }, [certificate.cert_code])

  useEffect(() => {
    // Check for download query param
    const params = new URLSearchParams(window.location.search)
    const downloadAction = params.get("download")
    
    if (downloadAction === "pdf" && qrDataUrl && !downloading) {
      handleDownloadPDF()
      // Remove the param from URL without refreshing
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    } else if (downloadAction === "png" && qrDataUrl && !downloading) {
      handleDownloadPNG()
      // Remove the param from URL without refreshing
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [qrDataUrl])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied",
      description: "Certificate link copied to clipboard",
    })
  }

  // ------------------------------------------------------
  //  CREATE HTML → RENDER → EXPORT VIA html2canvas / jsPDF
  // ------------------------------------------------------
  const renderCertificateCanvas = async (): Promise<HTMLCanvasElement> => {
    if (canvasCacheRef.current) return canvasCacheRef.current

    // Preload fonts before rendering to ensure consistent typography
    try {
      await preloadFonts()
    } catch (e) {
      console.warn("Font preloading failed, continuing anyway", e)
    }

    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const html = generateCertificateHTML({
      cert_code: certificate.cert_code,
      holder_name: certificate.holder_name,
      program_name: certificate.programName,
      issued_at: certificate.issued_at,
      expires_at: null,
      signature_hash: certificate.signature_hash,
      qr_code_data_url: qrDataUrl,
      logo_url: `${baseUrl}/logo-full.png`,
      logo_symbol_url: `${baseUrl}/logo-symbol.png`,
      signature_image_url: `${baseUrl}/signature.png`,
      verify_url: `${baseUrl}/c/${certificate.cert_code}`,
    })

    // Use an iframe to isolate the certificate styles from the main page
    const iframe = document.createElement("iframe")
    iframe.style.position = "absolute"
    iframe.style.left = "-9999px"
    iframe.style.top = "-9999px"
    iframe.style.width = "1122px"
    iframe.style.height = "794px"
    iframe.style.border = "none"
    iframe.style.opacity = "0"
    iframe.style.pointerEvents = "none"

    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) {
      document.body.removeChild(iframe)
      throw new Error("Failed to access iframe content")
    }

    // Write the HTML content to the iframe and wait for it to load
    await new Promise<void>((resolve) => {
      let resolved = false
      const done = () => {
        if (!resolved) {
          resolved = true
          resolve()
        }
      }

      iframe.onload = done
      iframeDoc.open()
      iframeDoc.write(html)
      iframeDoc.close()
      
      // Fallback: if onload doesn't fire (can happen with write())
      setTimeout(done, 1500)
    })

    // Wait for fonts and images inside the iframe
    const iframeWindow = iframe.contentWindow
    if (iframeWindow) {
      try {
        // Wait for fonts to be ready in the iframe
        if ((iframeWindow.document as any).fonts && (iframeWindow.document as any).fonts.ready) {
          await (iframeWindow.document as any).fonts.ready
        }
      } catch (e) {
        console.warn("Iframe font loading wait failed", e)
      }

      // Wait for all images to be loaded
      const images = Array.from(iframeWindow.document.getElementsByTagName("img"))
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((res) => {
            img.onload = res
            img.onerror = res
          })
        })
      )
    }

    // Extra wait for layout and final rendering
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    await new Promise((r) => setTimeout(r, 800))

    const iframeBody = iframe.contentDocument?.body
    if (!iframeBody) {
      document.body.removeChild(iframe)
      throw new Error("Failed to access iframe body after load")
    }

    // html2canvas is heavy (~200KB gzipped) and only needed on download, so it
    // is loaded on demand rather than shipped with the page bundle.
    const { default: html2canvas } = await import("html2canvas")
    const canvas = await html2canvas(iframeBody, {
      scale: 2,
      backgroundColor: "#020617",
      useCORS: true,
      allowTaint: true,
      width: 1122,
      height: 794,
      windowWidth: 1122,
      windowHeight: 794,
      logging: process.env.NODE_ENV !== "production",
    })

    document.body.removeChild(iframe)
    canvasCacheRef.current = canvas
    return canvas
  }

  const handleDownloadPDF = async () => {
    if (certificate.status === "REVOKED") {
      toast({
        title: "Cannot download",
        description: "Revoked certificates cannot be downloaded.",
        variant: "destructive",
      })
      return
    }

    if (!qrDataUrl) {
      toast({ title: "Please wait", description: "Preparing QR code..." })
      return
    }

    setDownloading("pdf")

    try {
      const canvas = await renderCertificateCanvas()
      // Loaded on demand for the same reason as html2canvas above.
      const { default: jsPDF } = await import("jspdf")
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1122, 794],
        compress: true,
      })

      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, 0, 1122, 794)
      pdf.save(`certificate-${certificate.cert_code}.pdf`)

      toast({ title: "Certificate ready", description: "PDF download started." })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      })
      // Clear cache on error to allow retry
      canvasCacheRef.current = null
    }

    setDownloading(null)
  }

  const handleDownloadPNG = async () => {
    if (certificate.status === "REVOKED") {
      toast({
        title: "Cannot download",
        description: "Revoked certificates cannot be downloaded.",
        variant: "destructive",
      })
      return
    }

    if (!qrDataUrl) {
      toast({ title: "Please wait", description: "Preparing QR code..." })
      return
    }

    setDownloading("png")

    try {
      const canvas = await renderCertificateCanvas()
      canvas.toBlob((blob) => {
        if (!blob) {
          toast({
            title: "Download failed",
            description: "Could not generate certificate image.",
            variant: "destructive",
          })
          return
        }

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `certificate-${certificate.cert_code}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({ title: "Certificate ready", description: "PNG download started." })
      }, "image/png", 1.0)
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Could not generate PNG. Please try again.",
        variant: "destructive",
      })
      // Clear cache on error to allow retry
      canvasCacheRef.current = null
    }

    setDownloading(null)
  }

  const formattedIssuedAt = useMemo(
    () =>
      new Date(certificate.issued_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [certificate.issued_at],
  )

  const formattedExpiresAt = useMemo(
    () =>
      certificate.expires_at
        ? new Date(certificate.expires_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null,
    [certificate.expires_at],
  )

  // ------------------------------------------------------
  //          UI RENDERING (unchanged from your design)
  // ------------------------------------------------------
  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      {/* Status Banner */}
      <div className={`rounded-xl border ${config.border} bg-white/5 p-4 backdrop-blur-xl`}>
        <div className="flex items-center gap-3">
          <div className={`rounded-full ${config.color} p-2`}>
            <StatusIcon className="h-6 w-6 text-[#0B0C10]" />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${config.text}`}>{config.label}</h2>
            <p className="truncate text-sm text-[#F3F7FA]/70">Certificate ID: {certificate.cert_code}</p>
          </div>
        </div>
      </div>

      {/* Revoked Warning */}
      {certificate.status === "REVOKED" && (
        <div className="rounded-xl border border-[#FF4B4B]/30 bg-[#FF4B4B]/10 p-3 backdrop-blur-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-[#FF4B4B]" />
            <p className="text-sm text-[#F3F7FA]">This certificate has been revoked and cannot be downloaded.</p>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* QR Preview */}
          <div className="flex flex-col items-center rounded-lg border border-[#12E8D5]/30 bg-white/5 p-4">
            {qrDataUrl && <img src={qrDataUrl} className="h-32 w-32 rounded-lg" alt="QR" />}
            <p className="mt-3 text-xs text-[#F3F7FA]/70">Scan to verify</p>
          </div>

          {/* Info */}
          <div className="space-y-4 lg:col-span-2">
            <div>
              <h3 className="text-xs text-[#F3F7FA]/70">Certificate Holder</h3>
              <p className="text-xl font-bold text-[#F3F7FA]">{certificate.holder_name}</p>
            </div>

            <div>
              <h3 className="text-xs text-[#F3F7FA]/70">Program</h3>
              <p className="text-lg font-semibold text-[#12E8D5]">{certificate.programName}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <h3 className="text-xs text-[#F3F7FA]/70">Issued At</h3>
                <p className="text-sm text-[#F3F7FA]">{formattedIssuedAt}</p>
              </div>
              {formattedExpiresAt && (
                <div>
                  <h3 className="text-xs text-[#F3F7FA]/70">
                    {certificate.status === "EXPIRED" ? "Expired On" : "Valid Until"}
                  </h3>
                  <p className="text-sm text-[#F3F7FA]">{formattedExpiresAt}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs text-[#F3F7FA]/70">Issuer</h3>
              <p className="text-sm text-[#F3F7FA]">Nexalaris Tech Private Limited</p>
            </div>

            {certificate.signature_hash && (
              <div>
                <h3 className="text-xs text-[#F3F7FA]/70">Signature Hash</h3>
                <p className="break-all font-mono text-xs text-[#F3F7FA]/70">
                  {certificate.signature_hash}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading !== null || certificate.status === "REVOKED" || !qrDataUrl}
            className="rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-[#0B0C10]"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading === "pdf" ? "Generating PDF..." : "Download PDF"}
          </Button>

          <Button
            onClick={handleDownloadPNG}
            disabled={downloading !== null || certificate.status === "REVOKED" || !qrDataUrl}
            className="rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-[#0B0C10]"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading === "png" ? "Generating PNG..." : "Download PNG"}
          </Button>

          <Button
            onClick={copyLink}
            variant="outline"
            className="rounded-xl border-white/20 bg-white/5 text-[#F3F7FA]"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-xl border border-[#8E2DE2]/30 bg-white/5 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-bold text-[#F3F7FA] mb-4">What this holder achieved</h3>

        <div className="space-y-3 text-[#F3F7FA]/90">
          <ReactMarkdown
            components={{
              ul: ({ children }) => <ul className="space-y-2 pl-5">{children}</ul>,
              li: ({ children }) => (
                <li className="text-sm leading-relaxed marker:text-[#12E8D5]">{children}</li>
              ),
            }}
          >
            {certificate.achievements_markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
