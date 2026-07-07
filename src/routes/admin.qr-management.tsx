import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, QrCode as QrCodeIcon, Link as LinkIcon, Info } from 'lucide-react';
import { downloadQRAsPNG } from '../lib/qr-utils';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/qr-management')({
  component: AdminQRManagement,
});

function AdminQRManagement() {
  const checkinUrl = `${window.location.origin}/checkin`;

  const handleDownloadAttendanceQR = () => {
    downloadQRAsPNG('attendance-qr', 'xyz-fitness-attendance-qr');
    toast.success('Attendance QR downloaded!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(checkinUrl);
    toast.success('Check-in link copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">QR Management</h2>
        <p className="text-muted-foreground mt-1">Manage and download your gym's official QR codes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Permanent Attendance QR Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCodeIcon className="h-5 w-5 text-indigo-500" />
              Permanent Attendance QR
            </CardTitle>
            <CardDescription>
              Print this code and place it at the front desk. Members can scan it with their phone's camera to check in automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <QRCode
                id="attendance-qr"
                value={checkinUrl}
                size={220}
                level="H"
                fgColor="#0f172a" // slate-900
              />
            </div>
            
            <div className="flex gap-4 w-full">
              <Button onClick={handleDownloadAttendanceQR} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              <Button onClick={handleCopyLink} variant="outline" className="flex-1">
                <LinkIcon className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 p-4 rounded-lg flex items-start gap-3 text-sm w-full">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <p>
                <strong>How it works:</strong> When members scan this, they are directed to the <code className="bg-indigo-100 px-1 rounded text-indigo-900">{checkinUrl}</code> route. The app authenticates them and logs their attendance instantly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Guest QR Info Card */}
        <Card className="border-border bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCodeIcon className="h-5 w-5 text-emerald-500" />
              Guest Pass QRs
            </CardTitle>
            <CardDescription>
              Manage one-time use QR codes for your guests.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
              <QrCodeIcon className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">Unique Guest QRs</h3>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Guest passes generate unique, single-use QR codes. You can generate and share these directly from the Guest Pass dashboard.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/admin/guest-passes'}>
              Go to Guest Passes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
