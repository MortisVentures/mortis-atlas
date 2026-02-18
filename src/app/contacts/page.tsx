import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getContacts } from "@/lib/db/contacts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { ContactsFilters } from "@/components/contacts/contacts-filters";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    companyId?: string;
  }>;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

// Loading skeleton
function ContactsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Contacts grid component
async function ContactsGrid({
  search,
  companyId,
  userId,
}: {
  search?: string;
  companyId?: string;
  userId: string;
}) {
  const contacts = await getContacts({ userId, search, companyId });

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-lg">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d={search || companyId
                ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                : "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              }
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium">
          {search || companyId ? "No matching contacts" : "No contacts yet"}
        </h3>
        <p className="text-muted-foreground mt-1 mb-4 max-w-sm">
          {search || companyId
            ? "Try adjusting your search or filters to find what you're looking for"
            : "Start building your network by adding your first contact"
          }
        </p>
        {!search && !companyId && (
          <Link href="/contacts/new">
            <Button>Add Contact</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <Link key={contact.id} href={`/contacts/${contact.id}`}>
            <Card className="bg-card/50 border-border hover:bg-card/80 transition-all cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center size-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white font-semibold shrink-0">
                    {getInitials(contact.firstName, contact.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      {contact.isPrimary && (
                        <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded-full shrink-0">
                          Primary
                        </span>
                      )}
                    </div>
                    {contact.role && (
                      <p className="text-sm text-muted-foreground truncate">
                        {contact.role}
                      </p>
                    )}
                    {contact.company && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {contact.company.name}
                      </p>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Footer with count */}
      <div className="mt-4 text-xs text-muted-foreground">
        Showing {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
        {(search || companyId) && " (filtered)"}
      </div>
    </>
  );
}

export default async function ContactsPage({ searchParams }: PageProps) {
  // Get authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  const userId = session.user.id;

  const params = await searchParams;
  const { search, companyId } = params;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your network of founders and partners
          </p>
        </div>
        <Link href="/contacts/new">
          <Button className="gap-2">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Contact
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ContactsFilters />
      </div>

      {/* Contacts Grid */}
      <Suspense fallback={<ContactsSkeleton />}>
        <ContactsGrid search={search} companyId={companyId} userId={userId} />
      </Suspense>
    </div>
  );
}
