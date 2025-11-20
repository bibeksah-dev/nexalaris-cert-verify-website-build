"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getCsrfTokenFromCookie } from "@/lib/csrf-client"

interface Program {
  id: string
  name: string
}

interface IssueFormProps {
  programs: Program[]
}

export function IssueForm({ programs }: IssueFormProps) {
  const [formData, setFormData] = useState({
    holder_name: "",
    holder_email: "",
    program_id: "",
    issued_at: new Date().toISOString().split("T")[0],
    expires_at: "",
    achievements_markdown: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/certificates/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() || "" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Certificate issued",
          description: `Certificate ${data.cert_code} has been created`,
        })
        router.push("/admin/manage")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to issue certificate",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to issue certificate",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="holder_name" className="text-[#F3F7FA]">
              Holder Name *
            </Label>
            <Input
              id="holder_name"
              value={formData.holder_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, holder_name: e.target.value }))}
              className="h-12 rounded-xl border-white/20 bg-white/10 text-[#F3F7FA]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holder_email" className="text-[#F3F7FA]">
              Holder Email
            </Label>
            <Input
              id="holder_email"
              type="email"
              value={formData.holder_email}
              onChange={(e) => setFormData((prev) => ({ ...prev, holder_email: e.target.value }))}
              className="h-12 rounded-xl border-white/20 bg-white/10 text-[#F3F7FA]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="program_id" className="text-[#F3F7FA]">
            Program *
          </Label>
          <Select
            value={formData.program_id}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, program_id: value }))}
          >
            <SelectTrigger className="h-12 rounded-xl border-white/20 bg-white/10 text-[#F3F7FA]">
              <SelectValue placeholder="Select a program" />
            </SelectTrigger>
            <SelectContent className="border-white/20 bg-[#0B0C10]">
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id} className="text-[#F3F7FA] focus:bg-white/10">
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="issued_at" className="text-[#F3F7FA]">
              Issued At *
            </Label>
            <Input
              id="issued_at"
              type="date"
              value={formData.issued_at}
              onChange={(e) => setFormData((prev) => ({ ...prev, issued_at: e.target.value }))}
              className="h-12 rounded-xl border-white/20 bg-white/10 text-[#F3F7FA]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires_at" className="text-[#F3F7FA]">
              Expires At (Optional)
            </Label>
            <Input
              id="expires_at"
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData((prev) => ({ ...prev, expires_at: e.target.value }))}
              className="h-12 rounded-xl border-white/20 bg-white/10 text-[#F3F7FA]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="achievements_markdown" className="text-[#F3F7FA]">
            Achievements (Markdown) *
          </Label>
          <Textarea
            id="achievements_markdown"
            value={formData.achievements_markdown}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                achievements_markdown: e.target.value,
              }))
            }
            className="min-h-[200px] rounded-xl border-white/20 bg-white/10 font-mono text-sm text-[#F3F7FA]"
            placeholder="- Achievement 1&#10;- Achievement 2&#10;- Achievement 3"
            required
          />
          <p className="text-xs text-[#F3F7FA]/50">Use markdown formatting. For example: - Bullet point</p>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="h-12 flex-1 rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-[#0B0C10] hover:scale-[1.02]"
          >
            {loading ? "Issuing..." : "Issue Certificate"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/dashboard")}
            className="h-12 rounded-xl border-white/20 bg-white/5 text-[#F3F7FA] hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
