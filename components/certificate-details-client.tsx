"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, Copy, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"
import QRCode from "qrcode"
import { useEffect } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface CertificateDetailsProps {
  certificate: {
    cert_code: string
    holder_name: string
    holder_email: string | null
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
  const [downloading, setDownloading] = useState<string | null>(null)
  const certificatePreviewRef = useRef<HTMLDivElement>(null)
  const config = statusConfig[certificate.status]
  const StatusIcon = config.icon

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = `${window.location.origin}/c/${certificate.cert_code}`
        const dataUrl = await QRCode.toDataURL(url, {
          width: 256,
          margin: 2,
          color: {
            dark: "#12E8D5",
            light: "#0B0C10",
          },
        })
        setQrDataUrl(dataUrl)
      } catch (err) {
        console.error("Failed to generate QR code", err)
      }
    }
    generateQR()
  }, [certificate.cert_code])

  const copyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied",
      description: "Certificate link copied to clipboard",
    })
  }

  const generateCertificateImage = async (): Promise<HTMLCanvasElement> => {
    const iframe = document.createElement("iframe")
    iframe.style.cssText = "position:fixed;left:-9999px;width:1122px;height:794px;"
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) throw new Error("Failed to create iframe document")

    const verifyUrl = `${window.location.origin}/c/${certificate.cert_code}`
    const qrCode = await QRCode.toDataURL(verifyUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: "#12E8D5",
        light: "#FFFFFF",
      },
    })

    iframeDoc.open()
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: rgb(10, 10, 10);
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
        </style>
      </head>
      <body>
        <div style="
          width: 1122px;
          height: 794px;
          background: rgb(10, 10, 10);
          padding: 60px;
          box-sizing: border-box;
        ">
          <div style="
            width: 100%;
            height: 100%;
            border: 2px solid rgba(18, 232, 213, 0.3);
            border-radius: 24px;
            background: rgb(10, 10, 10);
            padding: 50px;
            position: relative;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
          ">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="font-size: 42px; font-weight: bold; color: rgb(18, 232, 213); margin-bottom: 8px;">
                NEXALARIS TECH
              </div>
              <div style="font-size: 28px; color: rgb(142, 45, 226); font-weight: 600;">
                Certificate of Completion
              </div>
            </div>

            <!-- Content -->
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;">
              <div style="font-size: 20px; color: rgb(136, 136, 136);">
                This certifies that
              </div>
              <div style="font-size: 48px; font-weight: bold; color: rgb(255, 255, 255); text-align: center;">
                ${certificate.holder_name}
              </div>
              <div style="font-size: 20px; color: rgb(136, 136, 136);">
                has successfully completed
              </div>
              <div style="font-size: 36px; font-weight: 600; color: rgb(18, 232, 213); text-align: center;">
                ${certificate.programName}
              </div>
            </div>

            <!-- Footer -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px;">
              <div>
                <div style="font-size: 16px; color: rgb(136, 136, 136); margin-bottom: 6px;">Issue Date</div>
                <div style="font-size: 18px; color: rgb(255, 255, 255);">
                  ${new Date(certificate.issued_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div>
                <img src="${qrCode}" style="width: 100px; height: 100px; border-radius: 8px;" />
              </div>
              <div style="text-align: right;">
                <div style="font-size: 16px; color: rgb(136, 136, 136); margin-bottom: 6px;">Certificate ID</div>
                <div style="font-size: 18px; color: rgb(18, 232, 213); font-weight: 600;">
                  ${certificate.cert_code}
                </div>
              </div>
            </div>

            <!-- Corner decorations -->
            <div style="
              position: absolute;
              top: 15px;
              left: 15px;
              width: 80px;
              height: 80px;
              border: 2px solid rgb(142, 45, 226);
              border-right: none;
              border-bottom: none;
              border-radius: 24px 0 0 0;
            "></div>
            <div style="
              position: absolute;
              bottom: 15px;
              right: 15px;
              width: 80px;
              height: 80px;
              border: 2px solid rgb(18, 232, 213);
              border-left: none;
              border-top: none;
              border-radius: 0 0 24px 0;
            "></div>
          </div>
        </div>
      </body>
      </html>
    `)
    iframeDoc.close()

    await new Promise((resolve) => setTimeout(resolve, 100))

    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      backgroundColor: "rgb(10, 10, 10)",
      logging: false,
      useCORS: true,
      allowTaint: false,
    })

    document.body.removeChild(iframe)
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

    setDownloading("pdf")
    try {
      const canvas = await generateCertificateImage()

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1122, 794],
      })

      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, 0, 1122, 794)
      pdf.save(`certificate-${certificate.cert_code}.pdf`)

      toast({
        title: "Download started",
        description: "Your PDF certificate is downloading.",
      })
    } catch (error) {
      console.error("[v0] PDF generation error:", error)
      toast({
        title: "Download failed",
        description: "Failed to generate PDF certificate",
        variant: "destructive",
      })
    } finally {
      setDownloading(null)
    }
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

    setDownloading("png")
    try {
      const canvas = await generateCertificateImage()

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Failed to create PNG blob")
        }

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `certificate-${certificate.cert_code}.png`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Download started",
          description: "Your PNG certificate is downloading.",
        })
        setDownloading(null)
      }, "image/png")
    } catch (error) {
      console.error("[v0] PNG generation error:", error)
      toast({
        title: "Download failed",
        description: "Failed to generate PNG certificate",
        variant: "destructive",
      })
      setDownloading(null)
    }
  }

  const handleDownload = async (format: "pdf" | "png") => {
    if (certificate.status === "REVOKED") {
      toast({
        title: "Cannot download",
        description: "Revoked certificates cannot be downloaded.",
        variant: "destructive",
      })
      return
    }

    if (format === "pdf") {
      await handleDownloadPDF()
    } else {
      await handleDownloadPNG()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Status Banner */}
      <div className={`rounded-2xl border ${config.border} bg-white/5 p-6 backdrop-blur-xl`}>
        <div className="flex items-center gap-4">
          <div className={`rounded-full ${config.color} p-3`}>
            <StatusIcon className="h-8 w-8 text-[#0B0C10]" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${config.text}`}>{config.label}</h2>
            <p className="text-[#F3F7FA]/70">Certificate ID: {certificate.cert_code}</p>
          </div>
        </div>
      </div>

      {/* Revoked Warning */}
      {certificate.status === "REVOKED" && (
        <div className="rounded-2xl border border-[#FF4B4B]/30 bg-[#FF4B4B]/10 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-[#FF4B4B]" />
            <p className="text-sm text-[#F3F7FA]">This certificate has been revoked and cannot be downloaded.</p>
          </div>
        </div>
      )}

      {/* Certificate Details */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: QR Code */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#12E8D5]/30 bg-white/5 p-6">
            {qrDataUrl && <img src={qrDataUrl || "/placeholder.svg"} alt="QR Code" className="h-48 w-48 rounded-lg" />}
            <p className="mt-4 text-center text-sm text-[#F3F7FA]/70">Scan to verify</p>
          </div>

          {/* Right: Details */}
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-[#F3F7FA]/70">Certificate Holder</h3>
              <p className="text-2xl font-bold text-[#F3F7FA]">{certificate.holder_name}</p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-[#F3F7FA]/70">Program</h3>
              <p className="text-xl font-semibold text-[#12E8D5]">{certificate.programName}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium text-[#F3F7FA]/70">Issued At</h3>
                <p className="text-[#F3F7FA]">{formatDate(certificate.issued_at)}</p>
              </div>

              {certificate.expires_at && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-[#F3F7FA]/70">Expires At</h3>
                  <p className="text-[#F3F7FA]">{formatDate(certificate.expires_at)}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-[#F3F7FA]/70">Issuer</h3>
              <p className="text-[#F3F7FA]">Nexalaris Tech Private Limited</p>
            </div>

            {certificate.signature_hash && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-[#F3F7FA]/70">Signature Hash</h3>
                <p className="break-all font-mono text-sm text-[#F3F7FA]/70">{certificate.signature_hash}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            onClick={() => handleDownload("pdf")}
            disabled={downloading !== null || certificate.status === "REVOKED"}
            className="rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-[#0B0C10] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading === "pdf" ? "Generating PDF..." : "Download PDF"}
          </Button>
          <Button
            onClick={() => handleDownload("png")}
            disabled={downloading !== null || certificate.status === "REVOKED"}
            className="rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-[#0B0C10] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading === "png" ? "Generating PNG..." : "Download PNG"}
          </Button>
          <Button
            onClick={copyLink}
            variant="outline"
            className="rounded-xl border-white/20 bg-white/5 text-[#F3F7FA] hover:bg-white/10"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="rounded-2xl border border-[#8E2DE2]/30 bg-white/5 p-8 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2]" />
          <h3 className="text-2xl font-bold text-[#F3F7FA]">What this holder achieved</h3>
        </div>

        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            className="space-y-3 text-[#F3F7FA]/90"
            components={{
              ul: ({ children }) => <ul className="space-y-2 pl-5 text-background">{children}</ul>,
              li: ({ children }) => <li className="leading-relaxed marker:text-[#12E8D5]">{children}</li>,
            }}
          >
            {certificate.achievements_markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
