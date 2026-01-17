"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PersonIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EnvelopeClosedIcon,
} from "@radix-ui/react-icons";

import {
  DashboardLayout,
  DashboardContent,
  PageHeader,
  PageSection,
} from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// =============================================================================
// SAMPLE CONTACTS DATA
// =============================================================================

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  role: string | null;
  company: { id: string; name: string } | null;
  isPrimary: boolean;
}

const sampleContacts: Contact[] = [
  {
    id: "ct1",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah@techflow.ai",
    role: "CEO",
    company: { id: "c1", name: "TechFlow AI" },
    isPrimary: true,
  },
  {
    id: "ct2",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike@datasync.io",
    role: "CTO",
    company: { id: "c2", name: "DataSync Pro" },
    isPrimary: true,
  },
  {
    id: "ct3",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily@quantumlabs.io",
    role: "CFO",
    company: { id: "c3", name: "Quantum Labs" },
    isPrimary: false,
  },
  {
    id: "ct4",
    firstName: "Alex",
    lastName: "Wong",
    email: "alex@financeos.io",
    role: "Founder",
    company: { id: "c4", name: "FinanceOS" },
    isPrimary: true,
  },
  {
    id: "ct5",
    firstName: "Jennifer",
    lastName: "Lee",
    email: "jennifer@healthbridge.com",
    role: "CEO",
    company: { id: "c5", name: "HealthBridge" },
    isPrimary: true,
  },
  {
    id: "ct6",
    firstName: "David",
    lastName: "Brown",
    email: "david@cloudscale.io",
    role: "VP Engineering",
    company: { id: "c6", name: "CloudScale" },
    isPrimary: false,
  },
];

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

// =============================================================================
// CONTACTS PAGE
// =============================================================================

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredContacts = sampleContacts.filter((contact) =>
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <DashboardContent>
        <PageHeader
          title="Contacts"
          description="Manage your network of founders and partners"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Contacts" },
          ]}
        />

        {/* Contacts List */}
        <PageSection
          title={`All Contacts (${filteredContacts.length})`}
          actions={
            <div className="flex items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Link href="/contacts/new">
                <Button>
                  <PlusIcon className="size-4 mr-2" />
                  Add Contact
                </Button>
              </Link>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link href={`/contacts/${contact.id}`}>
                  <Card
                    variant="raised"
                    className={cn(
                      "p-4 cursor-pointer h-full",
                      "transition-all duration-200",
                      "hover:scale-[1.02] hover:-translate-y-0.5",
                      "hover:shadow-neu-dark-glow-navy"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center size-12 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 text-white font-semibold">
                        {getInitials(contact.firstName, contact.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground truncate">
                            {contact.firstName} {contact.lastName}
                          </h3>
                          {contact.isPrimary && (
                            <span className="px-2 py-0.5 text-xs bg-tactical-500/10 text-tactical-500 rounded-full">
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
                            <EnvelopeClosedIcon className="size-3" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}

            {filteredContacts.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No contacts found matching your search.
              </div>
            )}
          </div>
        </PageSection>
      </DashboardContent>
    </DashboardLayout>
  );
}
