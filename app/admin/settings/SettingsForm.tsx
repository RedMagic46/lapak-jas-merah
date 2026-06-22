"use client";

import { useState } from "react";
import { saveSystemSettingsAction } from "@/app/actions/admin";

interface SettingsFormProps {
  initialSettings: {
    autoVerifyEmail: boolean;
    maintenanceMode: boolean;
    maxUploadSizeMb: number;
    maxCodPerDay: number;
  };
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [autoVerify, setAutoVerify] = useState(initialSettings.autoVerifyEmail);
  const [maintenance, setMaintenance] = useState(initialSettings.maintenanceMode);
  const [maxUpload, setMaxUpload] = useState(initialSettings.maxUploadSizeMb);
  const [maxCod, setMaxCod] = useState(initialSettings.maxCodPerDay);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("autoVerifyEmail", autoVerify ? "true" : "false");
    formData.append("maintenanceMode", maintenance ? "true" : "false");
    formData.append("maxUploadSizeMb", String(maxUpload));
    formData.append("maxCodPerDay", String(maxCod));

    try {
      const res = await saveSystemSettingsAction(null, formData);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else if (res?.validationErrors) {
        setMessage({ type: "error", text: Object.values(res.validationErrors).join(", ") });
      } else {
        setMessage({ type: "success", text: "Konfigurasi sistem berhasil diperbarui!" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi server." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-primary-container/15 text-primary border border-primary/20"
              : "bg-error-container/10 text-error border border-error/20"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {message.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 shadow-sm">
        <h3 className="font-title-lg text-body-lg font-bold text-on-surface mb-4">Pengaturan Global</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
            <div>
              <h4 className="font-bold text-sm text-on-surface">Auto-verifikasi Domain Email UMM</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Ijinkan pendaftaran akun langsung aktif jika menggunakan webmail.umm.ac.id.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoVerify}
              onChange={(e) => setAutoVerify(e.target.checked)}
              className="rounded border-outline-variant text-primary focus:ring-primary h-5 w-5 cursor-pointer accent-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
            <div>
              <h4 className="font-bold text-sm text-on-surface">Mode Pemeliharaan (Maintenance)</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Tutup akses pasar sementara waktu untuk proses perbaikan database.
              </p>
            </div>
            <input
              type="checkbox"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="rounded border-outline-variant text-primary focus:ring-primary h-5 w-5 cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/25 shadow-sm">
        <h3 className="font-title-lg text-body-lg font-bold text-on-surface mb-4">Batasan Transaksi &amp; Keamanan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Maksimum Ukuran Upload Foto (MB)
            </label>
            <input
              type="number"
              value={maxUpload}
              onChange={(e) => setMaxUpload(parseInt(e.target.value) || 0)}
              className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
              required
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Batas Maksimal COD per Hari
            </label>
            <input
              type="number"
              value={maxCod}
              onChange={(e) => setMaxCod(parseInt(e.target.value) || 0)}
              className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 outline-none font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
              required
              min={1}
            />
          </div>
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Menyimpan..." : "Simpan Konfigurasi"}
          </button>
        </div>
      </div>
    </form>
  );
}
