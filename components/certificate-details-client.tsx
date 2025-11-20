"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Copy, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QRCode from "qrcode"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import ReactMarkdown from "react-markdown"

import { generateCertificateHTML } from "@/lib/certificate-template" // your new template

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

  const config = statusConfig[certificate.status]
  const StatusIcon = config.icon

  // ---------------------------
  //  Generate Verification QR
  // ---------------------------
  useEffect(() => {
    const generateQR = async () => {
      const verifyUrl = `${window.location.origin}/c/${certificate.cert_code}`
      const dataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#12E8D5",
          light: "#0B0C10",
        },
      })
      setQrDataUrl(dataUrl)
    }
    generateQR()
  }, [certificate.cert_code])

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
    return new Promise(async (resolve) => {
      const container = document.createElement("div")
      container.style.position = "fixed"
      container.style.left = "-9999px"
      container.style.top = "0"
      container.style.width = "1122px"
      container.style.height = "794px"
      container.style.background = "#020617"

      const html = generateCertificateHTML({
        cert_code: certificate.cert_code,
        holder_name: certificate.holder_name,
        program_name: certificate.programName,
        issued_at: certificate.issued_at,
        expires_at: null,
        signature_hash: certificate.signature_hash,
        qr_code_data_url: qrDataUrl,
        logo_url: "/logo-full.png",
        logo_symbol_url: "/logo-symbol.png",
        signature_image_url: "/signature.png",
      })

      container.innerHTML = html
      document.body.appendChild(container)

      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#020617",
        useCORS: true,
      })

      document.body.removeChild(container)
      resolve(canvas)
    })
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
      const canvas = await renderCertificateCanvas()
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1122, 794],
      })

      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, 0, 1122, 794)
      pdf.save(`certificate-${certificate.cert_code}.pdf`)

      toast({ title: "Certificate ready", description: "PDF download started." })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Could not generate PDF.",
        variant: "destructive",
      })
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

    setDownloading("png")

    try {
      const canvas = await renderCertificateCanvas()
      canvas.toBlob((blob) => {
        if (!blob) return

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `certificate-${certificate.cert_code}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({ title: "Certificate ready", description: "PNG download started." })
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Could not generate PNG.",
        variant: "destructive",
      })
    }

    setDownloading(null)
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

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
                <p className="text-sm text-[#F3F7FA]">{formatDate(certificate.issued_at)}</p>
              </div>
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
            disabled={downloading !== null || certificate.status === "REVOKED"}
            className="rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-[#0B0C10]"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading === "pdf" ? "Generating PDF..." : "Download PDF"}
          </Button>

          <Button
            onClick={handleDownloadPNG}
            disabled={downloading !== null || certificate.status === "REVOKED"}
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
