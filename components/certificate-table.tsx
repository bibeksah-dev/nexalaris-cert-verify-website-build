"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Ban } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Certificate {
  id: string
  cert_code: string
  holder_name: string
  issued_at: string
  status: "VALID" | "EXPIRED" | "REVOKED"
  programs: {
    name: string
    slug: string
  }
}

interface CertificateTableProps {
  certificates: Certificate[]
}

const statusColors = {
  VALID: "bg-[#14F195] text-[#0B0C10]",
  EXPIRED: "bg-[#FFC857] text-[#0B0C10]",
  REVOKED: "bg-[#FF4B4B] text-white",
}

export function CertificateTable({ certificates: initialCerts }: CertificateTableProps) {
  const [certificates, setCertificates] = useState(initialCerts)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [selectedCertCode, setSelectedCertCode] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleRevoke = async () => {
    if (!selectedCertCode) return

    try {
      const response = await fetch(`/api/admin/certificates/${selectedCertCode}/revoke`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Certificate revoked",
          description: "The certificate has been revoked successfully",
        })
        // Update local state
        setCertificates((prev) =>
          prev.map((cert) => (cert.cert_code === selectedCertCode ? { ...cert, status: "REVOKED" as const } : cert)),
        )
      } else {
        toast({
          title: "Error",
          description: "Failed to revoke certificate",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke certificate",
        variant: "destructive",
      })
    } finally {
      setRevokeDialogOpen(false)
      setSelectedCertCode(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-[#F3F7FA]">Cert ID</TableHead>
              <TableHead className="text-[#F3F7FA]">Holder</TableHead>
              <TableHead className="text-[#F3F7FA]">Program</TableHead>
              <TableHead className="text-[#F3F7FA]">Status</TableHead>
              <TableHead className="text-[#F3F7FA]">Issued</TableHead>
              <TableHead className="text-right text-[#F3F7FA]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((cert) => (
              <TableRow key={cert.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-mono text-[#F3F7FA]">{cert.cert_code}</TableCell>
                <TableCell className="text-[#F3F7FA]">{cert.holder_name}</TableCell>
                <TableCell className="text-[#F3F7FA]/70">{cert.programs.name}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[cert.status]} rounded-full`}>{cert.status}</Badge>
                </TableCell>
                <TableCell className="text-[#F3F7FA]/70">{formatDate(cert.issued_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/c/${cert.cert_code}`)}
                      className="text-[#12E8D5] hover:bg-[#12E8D5]/10"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`/api/certificates/${cert.cert_code}/export?format=pdf`, "_blank")}
                      className="text-[#8E2DE2] hover:bg-[#8E2DE2]/10"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {cert.status !== "REVOKED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCertCode(cert.cert_code)
                          setRevokeDialogOpen(true)
                        }}
                        className="text-[#FF4B4B] hover:bg-[#FF4B4B]/10"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent className="border-white/10 bg-[#0B0C10]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#F3F7FA]">Revoke Certificate</AlertDialogTitle>
            <AlertDialogDescription className="text-[#F3F7FA]/70">
              Are you sure you want to revoke this certificate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-white/5 text-[#F3F7FA] hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} className="bg-[#FF4B4B] text-white hover:bg-[#FF4B4B]/90">
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
