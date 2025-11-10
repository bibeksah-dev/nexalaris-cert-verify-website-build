"use client"

import type React from "react"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Password updated",
          description: "Your password has been changed successfully",
        })
        setFormData({
          current_password: "",
          new_password: "",
          confirm_new_password: "",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#F3F7FA]">Settings</h1>
          <p className="mt-2 text-[#F3F7FA]/70">Manage your admin account settings</p>
        </div>

        <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <h2 className="mb-6 text-2xl font-bold text-[#F3F7FA]">Change Password</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current_password" className="text-[#F3F7FA]">
                Current Password
              </Label>
              <Input
                id="current_password"
                type="password"
                value={formData.current_password}
                onChange={(e) => setFormData((prev) => ({ ...prev, current_password: e.target.value }))}
                className="h-12 rounded-xl border-white/20 bg-white/10 text-[#F3F7FA]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password" className="text-[#F3F7FA]">
                New Password
              </Label>
              <Input
                id="new_password"
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData((prev) => ({ ...prev, new_password: e.target.value }))}
                className="h-12 rounded-xl border-white/20 bg-white/10 text-[#F3F7FA]"
                required
                minLength={8}
              />
              <p className="text-xs text-[#F3F7FA]/50">Must be at least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_new_password" className="text-[#F3F7FA]">
                Confirm New Password
              </Label>
              <Input
                id="confirm_new_password"
                type="password"
                value={formData.confirm_new_password}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirm_new_password: e.target.value }))}
                className="h-12 rounded-xl border-white/20 bg-white/10 text-[#F3F7FA]"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-[#0B0C10] hover:scale-[1.02]"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
