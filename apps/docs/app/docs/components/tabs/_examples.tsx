"use client";

import { Tabs } from "@togetheragency/ui/tabs";
import { useState } from "react";

const settingsTabs = [
  {
    id: "account",
    label: "Account",
    title: "Account Settings",
    body: "Manage your account information and preferences.",
  },
  {
    id: "security",
    label: "Security",
    title: "Security Settings",
    body: "Configure two-factor authentication and password settings.",
  },
  {
    id: "notifications",
    label: "Notifications",
    title: "Notification Preferences",
    body: "Choose how and when you want to receive notifications.",
  },
  {
    id: "billing",
    label: "Billing",
    title: "Billing Information",
    body: "View and manage your subscription and payment methods.",
  },
];

export function BasicTabsExample() {
  return (
    <Tabs.Root defaultValue="account" className="w-full max-w-xl">
      <Tabs.Container>
        <Tabs.List
          aria-label="Settings sections"
          className="rounded-full bg-secondary p-1"
        >
          {settingsTabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              id={tab.id}
              className="flex-1 py-2 text-foreground"
            >
              <Tabs.Separator />
              <span className="text-foreground">{tab.label}</span>
              <Tabs.Indicator className="rounded-full bg-background py-3 ring-1 ring-border" />
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Container>
      {settingsTabs.map((tab) => (
        <Tabs.Content key={tab.id} id={tab.id} className="px-1 py-4">
          <h3 className="mb-1 font-semibold text-foreground">{tab.title}</h3>
          <p className="text-sm text-muted-foreground">{tab.body}</p>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export function VerticalTabsExample() {
  return (
    <Tabs.Root
      orientation="vertical"
      defaultValue="account"
      className="w-full max-w-xl rounded-2xl border border-border bg-card p-2"
    >
      <Tabs.Container>
        <Tabs.List
          aria-label="Vertical tabs"
          className="w-44 gap-1 rounded-xl bg-secondary p-1"
        >
          {settingsTabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              id={tab.id}
              className="h-9 w-full justify-start px-3"
            >
              {tab.label}
              <Tabs.Indicator className="rounded-lg bg-background shadow-sm ring-1 ring-border" />
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Container>
      {settingsTabs.map((tab) => (
        <Tabs.Content key={tab.id} id={tab.id} className="flex-1 px-4 py-2">
          <h3 className="mb-1 font-semibold text-foreground">{tab.title}</h3>
          <p className="text-sm text-muted-foreground">{tab.body}</p>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export function ControlledTabsExample() {
  const [value, setValue] = useState("account");
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Active:</span>
        <code className="rounded-md bg-muted px-2 py-0.5 font-mono">
          {value}
        </code>
        <div className="ml-auto flex gap-1">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setValue(tab.id)}
              className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <Tabs.Root value={value} onValueChange={setValue}>
        <Tabs.Container>
          <Tabs.List
            aria-label="Controlled tabs"
            className="rounded-full bg-secondary p-1"
          >
            {settingsTabs.map((tab) => (
              <Tabs.Trigger key={tab.id} id={tab.id} className="flex-1">
                <Tabs.Separator />
                {tab.label}
                <Tabs.Indicator className="rounded-full bg-background shadow-sm ring-1 ring-border" />
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Container>
        {settingsTabs.map((tab) => (
          <Tabs.Content key={tab.id} id={tab.id} className="px-1 py-4">
            <h3 className="mb-1 font-semibold text-foreground">{tab.title}</h3>
            <p className="text-sm text-muted-foreground">{tab.body}</p>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  );
}

export function ManualActivationTabsExample() {
  return (
    <Tabs.Root
      defaultValue="account"
      activationMode="manual"
      className="w-full max-w-xl"
    >
      <Tabs.Container>
        <Tabs.List
          aria-label="Manual activation"
          className="rounded-full bg-secondary p-1"
        >
          {settingsTabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              id={tab.id}
              className="flex-1 py-2 text-foreground"
            >
              <Tabs.Separator />
              <span className="text-foreground">{tab.label}</span>
              <Tabs.Indicator className="rounded-full bg-background py-3 ring-1 ring-border" />
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Container>
      {settingsTabs.map((tab) => (
        <Tabs.Content key={tab.id} id={tab.id} className="px-1 py-4">
          <h3 className="mb-1 font-semibold text-foreground">{tab.title}</h3>
          <p className="text-sm text-muted-foreground">{tab.body}</p>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export function DisabledTabsExample() {
  return (
    <Tabs.Root defaultValue="account" className="w-full max-w-xl">
      <Tabs.Container>
        <Tabs.List
          aria-label="With a disabled tab"
          className="rounded-full bg-secondary p-1"
        >
          {settingsTabs.map((tab, i) => (
            <Tabs.Trigger
              key={tab.id}
              id={tab.id}
              disabled={i === 2}
              className="flex-1 py-2 text-foreground"
            >
              <Tabs.Separator />
              <span className="text-foreground">{tab.label}</span>
              <Tabs.Indicator className="rounded-full bg-background py-3 ring-1 ring-border" />
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Container>
      {settingsTabs.map((tab) => (
        <Tabs.Content key={tab.id} id={tab.id} className="px-1 py-4">
          <h3 className="mb-1 font-semibold text-foreground">{tab.title}</h3>
          <p className="text-sm text-muted-foreground">{tab.body}</p>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export function AutoplayTabsExample() {
  return (
    <Tabs.Root
      defaultValue="account"
      autoplay
      autoplayDelay={2500}
      className="w-full max-w-xl"
    >
      <Tabs.Container>
        <Tabs.List
          aria-label="Autoplay tabs"
          className="rounded-full bg-secondary p-1"
        >
          {settingsTabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              id={tab.id}
              className="flex-1 py-2 text-foreground"
            >
              <Tabs.Separator />
              <span className="text-foreground">{tab.label}</span>
              <Tabs.Indicator className="rounded-full bg-background py-3 ring-1 ring-border" />
              <Tabs.Progress className="inset-x-2 bottom-1 h-0.5 rounded-full bg-foreground/60" />
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Container>
      {settingsTabs.map((tab) => (
        <Tabs.Content key={tab.id} id={tab.id} className="px-1 py-4">
          <h3 className="mb-1 font-semibold text-foreground">{tab.title}</h3>
          <p className="text-sm text-muted-foreground">{tab.body}</p>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export function AutoplayUnderlineTabsExample() {
  return (
    <Tabs.Root
      defaultValue="account"
      autoplay
      autoplayDelay={3000}
      className="w-full max-w-xl"
    >
      <Tabs.Container>
        <Tabs.List
          aria-label="Autoplay underline tabs"
          className="gap-2 border-b border-border bg-transparent p-0 pb-0!"
        >
          {settingsTabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              id={tab.id}
              className="h-10 rounded-none px-3 text-muted-foreground data-[state=active]:text-foreground"
            >
              {tab.label}
              <Tabs.Indicator className="inset-x-0! top-auto! -bottom-px! z-10! h-0.5 rounded-none bg-foreground/30 shadow-none ring-0" />
              <Tabs.Progress className="inset-x-0 top-auto -bottom-px z-20 h-0.5 rounded-none bg-foreground" />
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Container>
      {settingsTabs.map((tab) => (
        <Tabs.Content key={tab.id} id={tab.id} className="px-1 py-4">
          <h3 className="mb-1 font-semibold text-foreground">{tab.title}</h3>
          <p className="text-sm text-muted-foreground">{tab.body}</p>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export function VerticalAutoplayUnderlineTabsExample() {
  return (
    <Tabs.Root
      orientation="vertical"
      defaultValue="account"
      autoplay
      autoplayDelay={3000}
      className="w-full max-w-xl"
    >
      <Tabs.Container>
        <Tabs.List
          aria-label="Vertical autoplay underline tabs"
          className="w-44 gap-1 border-l border-border bg-transparent p-0 pl-0!"
        >
          {settingsTabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              id={tab.id}
              className="h-10 w-full justify-start rounded-none px-4 text-muted-foreground data-[state=active]:text-foreground"
            >
              {tab.label}
              <Tabs.Indicator className="inset-y-0! right-auto! -left-px! z-10! h-full w-0.5 rounded-none bg-foreground/30 shadow-none ring-0" />
              <Tabs.Progress className="inset-y-0 right-auto -left-px z-20 h-full w-0.5 rounded-none bg-foreground" />
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Container>
      {settingsTabs.map((tab) => (
        <Tabs.Content key={tab.id} id={tab.id} className="flex-1 px-4 py-2">
          <h3 className="mb-1 font-semibold text-foreground">{tab.title}</h3>
          <p className="text-sm text-muted-foreground">{tab.body}</p>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export function UnderlineTabsExample() {
  return (
    <Tabs.Root defaultValue="account" className="w-full max-w-xl">
      <Tabs.Container>
        <Tabs.List
          aria-label="Underline tabs"
          className="gap-2 border-b border-border bg-transparent p-0 pb-0!"
        >
          {settingsTabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              id={tab.id}
              className="h-10 rounded-none px-3 text-muted-foreground data-[state=active]:text-foreground"
            >
              {tab.label}
              <Tabs.Indicator className="inset-x-0! top-auto! -bottom-px! z-10! h-0.5 rounded-none bg-foreground shadow-none ring-0" />
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Container>
      {settingsTabs.map((tab) => (
        <Tabs.Content key={tab.id} id={tab.id} className="px-1 py-4">
          <h3 className="mb-1 font-semibold text-foreground">{tab.title}</h3>
          <p className="text-sm text-muted-foreground">{tab.body}</p>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
