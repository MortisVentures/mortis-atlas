import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  CalendarIcon,
  FileTextIcon,
  FileIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";

async function getLPDocuments(_userId: string) {
  // Get LP-accessible documents
  const documents = await prisma.document.findMany({
    where: {
      accessLevel: "LP_ACCESSIBLE",
    },
    select: {
      id: true,
      name: true,
      description: true,
      documentType: true,
      fileUrl: true,
      fileSize: true,
      fileType: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return { documents };
}

const DOCUMENT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; description: string }
> = {
  LEGAL: {
    label: "Legal",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    description: "Fund agreements, subscription documents",
  },
  BOARD_NOTES: {
    label: "Reports",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    description: "Quarterly and annual reports",
  },
  REFERENCE: {
    label: "Reference",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    description: "Tax documents, K-1s",
  },
  DD_REPORT: {
    label: "Due Diligence",
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    description: "Investment materials",
  },
};

export default async function LPDocumentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { documents } = await getLPDocuments(session.user.id);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1000000) {
      return `${(bytes / 1000000).toFixed(1)} MB`;
    }
    return `${(bytes / 1000).toFixed(0)} KB`;
  };

  // Group documents by type
  const groupedDocs = documents.reduce(
    (acc, doc) => {
      const type = doc.documentType || "REFERENCE";
      if (!acc[type]) acc[type] = [];
      acc[type].push(doc);
      return acc;
    },
    {} as Record<string, typeof documents>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Documents
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Access your fund documents, tax forms, and legal agreements
        </p>
      </div>

      {/* Security Notice */}
      <Card className="bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <LockClosedIcon className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                All documents are confidential and intended solely for your use
                as an investor. Please do not share or distribute.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories */}
      {Object.entries(DOCUMENT_TYPE_CONFIG).map(([type, config]) => {
        const docs = groupedDocs[type] || [];
        if (docs.length === 0) return null;

        return (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-neutral-500 text-sm font-normal">
                  {config.description}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <FileIcon className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span className="uppercase">{doc.fileType}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* No Documents Message */}
      {documents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileTextIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              No documents are currently available.
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              Documents will appear here once they are uploaded and shared with
              you.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
