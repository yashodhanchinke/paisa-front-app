import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone } from "lucide-react";

export default function MobilePreview() {
  const appUrl = window.location.origin;

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-primary" />
            <CardTitle>Mobile Preview</CardTitle>
          </div>
          <CardDescription>
            Scan this QR code with your phone to test the app on mobile
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="bg-white p-6 rounded-lg">
            <QRCodeSVG 
              value={appUrl} 
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Or visit directly:
            </p>
            <a 
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-mono text-sm"
            >
              {appUrl}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
