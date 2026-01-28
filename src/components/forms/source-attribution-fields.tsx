"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { DealSource } from "@prisma/client";
import {
  TargetIcon,
  PersonIcon,
  MagnifyingGlassIcon,
  Cross2Icon,
  CalendarIcon,
} from "@radix-ui/react-icons";

import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Badge not used in this file
// cn not used in this file

// =============================================================================
// TYPES
// =============================================================================

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  role: string | null;
  company: { name: string } | null;
}

interface SourceAttributionFieldsProps {
  /** Field name prefix for nested form structures */
  namePrefix?: string;
  /** Whether the form is for a company or deal */
  entityType: "company" | "deal";
}

// =============================================================================
// SOURCE CONFIG
// =============================================================================

const SOURCE_OPTIONS: { value: DealSource; label: string; description: string }[] = [
  { value: "REFERRAL", label: "Referral", description: "Personal or professional referral" },
  { value: "PORTFOLIO", label: "Portfolio Referral", description: "Referred by portfolio company" },
  { value: "INVESTOR_NETWORK", label: "Co-Investor", description: "Referred by another investor" },
  { value: "CONFERENCE", label: "Conference/Event", description: "Met at industry event" },
  { value: "ACCELERATOR", label: "Accelerator", description: "YC, Techstars, etc." },
  { value: "NETWORK", label: "Network", description: "Professional or university network" },
  { value: "INBOUND", label: "Inbound", description: "Company reached out to us" },
  { value: "DIRECT_OUTREACH", label: "Direct Outreach", description: "Proactive outreach by our team" },
  { value: "OTHER", label: "Other", description: "Other source" },
];

// Sources that require a referrer
const REFERRER_REQUIRED_SOURCES: DealSource[] = [
  "REFERRAL",
  "PORTFOLIO",
  "INVESTOR_NETWORK",
];

// =============================================================================
// CONTACT SEARCH COMPONENT
// =============================================================================

interface ContactSearchProps {
  value: string | null;
  onChange: (contactId: string | null, contact: Contact | null) => void;
  selectedContact: Contact | null;
  disabled?: boolean;
  required?: boolean;
}

function ContactSearch({
  value: _value,
  onChange,
  selectedContact,
  disabled,
  required,
}: ContactSearchProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search contacts
  React.useEffect(() => {
    if (!query || query.length < 2) {
      setContacts([]);
      return;
    }

    const searchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/contacts?search=${encodeURIComponent(query)}`);
        if (response.ok) {
          const json = await response.json();
          setContacts(json.data || []);
        }
      } catch (error) {
        console.error("Error searching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchContacts, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (contact: Contact) => {
    onChange(contact.id, contact);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null, null);
    setQuery("");
  };

  if (selectedContact) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-border">
        <div className="w-8 h-8 rounded-full bg-navy-500/20 flex items-center justify-center flex-shrink-0">
          <PersonIcon className="size-4 text-navy-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">
            {selectedContact.firstName} {selectedContact.lastName}
          </div>
          <div className="text-xs text-muted-foreground">
            {selectedContact.role && <span>{selectedContact.role}</span>}
            {selectedContact.role && selectedContact.company && <span> at </span>}
            {selectedContact.company && <span>{selectedContact.company.name}</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="p-1 rounded hover:bg-muted/50 transition-colors"
          disabled={disabled}
        >
          <Cross2Icon className="size-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search contacts..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 bg-background"
          disabled={disabled}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (query.length >= 2 || contacts.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {contacts.length === 0 && !isLoading && query.length >= 2 && (
            <div className="p-3 text-sm text-muted-foreground text-center">
              No contacts found
            </div>
          )}
          {contacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => handleSelect(contact)}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium">
                  {contact.firstName[0]}{contact.lastName[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {contact.firstName} {contact.lastName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {contact.role && <span>{contact.role}</span>}
                  {contact.role && contact.company && <span> at </span>}
                  {contact.company && <span>{contact.company.name}</span>}
                  {!contact.role && !contact.company && contact.email && (
                    <span>{contact.email}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {required && (
        <p className="text-xs text-muted-foreground mt-1">
          Required when source is Referral, Portfolio Referral, or Co-Investor
        </p>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SourceAttributionFields({
  namePrefix = "",
  entityType,
}: SourceAttributionFieldsProps) {
  const form = useFormContext();
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);

  // Watch the source type to determine if referrer is required
  const sourceType = form.watch(namePrefix ? `${namePrefix}.sourceType` : "sourceType");
  const isReferrerRequired = REFERRER_REQUIRED_SOURCES.includes(sourceType as DealSource);

  // Get field names with optional prefix
  const getFieldName = (name: string) => namePrefix ? `${namePrefix}.${name}` : name;

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TargetIcon className="size-5 text-tactical-400" />
          Source Attribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Type */}
          <FormField
            control={form.control}
            name={getFieldName("sourceType")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  How did you hear about this {entityType}?
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select source channel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {SOURCE_OPTIONS.find(o => o.value === field.value)?.description ||
                   "Track where this opportunity came from"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Referral Date */}
          <FormField
            control={form.control}
            name={getFieldName("referralDate")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referral Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="date"
                      className="pl-9 bg-background"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  </div>
                </FormControl>
                <FormDescription>When was this introduced/referred?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Referrer Contact */}
        <FormField
          control={form.control}
          name={getFieldName("referrerContactId")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Referred By
                {isReferrerRequired && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <ContactSearch
                  value={field.value}
                  onChange={(contactId, contact) => {
                    field.onChange(contactId);
                    setSelectedContact(contact);
                  }}
                  selectedContact={selectedContact}
                  required={isReferrerRequired}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Source Detail / Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name={getFieldName("sourceChannel")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Channel</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., TC Disrupt, YC W24, LinkedIn"
                    className="bg-background"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>Specific event, program, or channel</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={getFieldName("sourceDetail")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Context</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Warm intro via board member"
                    className="bg-background"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>Any additional details about the source</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
