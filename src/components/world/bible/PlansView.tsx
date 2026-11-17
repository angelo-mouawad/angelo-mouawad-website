"use client";

import { ArrowLeft, ArrowRight, Check, Circle, CircleCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { getPlan, PLANS } from "@/lib/bible/data/plans";
import { dayAlreadyRead, isDayDone, isRead, planStatus } from "@/lib/bible/services/progress";
import { useStore } from "@/lib/bible/store/AppStore";
import type { PlanDay, ReadingPlan } from "@/lib/bible/types/plans";
import { formatReadings, formatRef } from "@/lib/bible/utils/references";
import { Button } from "@/components/ui/button";
import { RevealGroup, RevealItem } from "@/components/world/motion";
import { Chip, MonoLabel, Panel } from "@/components/world/primitives";
import { cn } from "@/lib/utils";
import { EmptyState, PageHeader, ProgressRing, useConfirm, useNav } from "./ui";

const PAGE_SIZE = 30;

export function PlansView({ planId, day }: { planId?: string; day?: number }) {
  const { data } = useStore();
  const nav = useNav();

  if (planId) {
    const plan = getPlan(planId);
    if (!plan) {
      return (
        <div className="pt-10">
          <EmptyState title="This reading plan could not be found" action={{ label: "See all plans", onClick: () => nav.go({ view: "plans" }) }}>
            It may have been renamed or removed.
          </EmptyState>
        </div>
      );
    }
    return <PlanDetail key={`${plan.id}:${day ?? ""}`} plan={plan} focusDay={day} />;
  }

  if (PLANS.length === 0) {
    return (
      <div className="pt-10">
        <EmptyState title="No reading plans are available">Plan files are missing from this copy of the site.</EmptyState>
      </div>
    );
  }

  const active = PLANS.filter((plan) => data.plans[plan.id]);
  const others = PLANS.filter((plan) => !data.plans[plan.id]);

  return (
    <div className="flex flex-col gap-12 pt-8">
      <PageHeader
        label="Reading plans"
        title="A little to read each day."
        lead="Follow several at once. Each keeps its own place, and chapters you have already read are recognised everywhere."
      />

      {active.length > 0 && (
        <section aria-labelledby="your-plans" className="flex flex-col gap-5">
          <h2 id="your-plans" className="type-h3">
            Your plans
          </h2>
          <RevealGroup className="grid gap-5 md:grid-cols-2">
            {active.map((plan) => {
              const status = planStatus(plan, data.plans[plan.id]);
              return (
                <RevealItem key={plan.id}>
                  <Panel surface="glass" className="flex h-full flex-col gap-5 p-6">
                    <div className="flex items-center gap-5">
                      <ProgressRing
                        value={status.total ? status.completedCount / status.total : 0}
                        size={84}
                        display={`${status.completedCount}/${status.total}`}
                        label={`${status.completedCount} of ${status.total} days done`}
                      />
                      <div className="flex min-w-0 flex-col gap-2">
                        <h3 className="font-display text-xl font-semibold tracking-tight text-balance">{plan.name}</h3>
                        <MonoLabel>{status.finished ? "Finished" : `Day ${status.nextDay?.day} of ${status.total}`}</MonoLabel>
                      </div>
                    </div>
                    {status.nextDay && (
                      <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-card/60 px-4 py-3">
                        <p className="type-label text-[0.5625rem] text-muted-foreground">Up next</p>
                        <p className="font-display text-base font-semibold tracking-tight">{status.nextDay.title ?? formatReadings(status.nextDay.readings)}</p>
                        {status.nextDay.title && <p className="type-small">{formatReadings(status.nextDay.readings)}</p>}
                      </div>
                    )}
                    <div className="mt-auto">
                      <Button size="sm" onClick={() => nav.go({ view: "plans", planId: plan.id })}>
                        {status.finished ? "Look back" : "Continue"}
                        <ArrowRight aria-hidden="true" className="group-hover/button:translate-x-0.5" />
                      </Button>
                    </div>
                  </Panel>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </section>
      )}

      {others.length > 0 && (
        <section aria-labelledby="all-plans" className="flex flex-col gap-5">
          <h2 id="all-plans" className="type-h3">
            {active.length ? "More plans" : "Choose a plan"}
          </h2>
          <RevealGroup className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {others.map((plan) => (
              <RevealItem key={plan.id}>
                <PlanCard plan={plan} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}
    </div>
  );
}

function PlanCard({ plan }: { plan: ReadingPlan }) {
  const { actions } = useStore();
  const nav = useNav();
  const featured = plan.id === "beginner";
  return (
    <Panel surface="glass" ticks={featured} className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-wrap gap-2">
        <Chip>{plan.days.length} days</Chip>
        <Chip>{plan.difficulty}</Chip>
        {featured && <Chip tone="accent">Best place to start</Chip>}
      </div>
      <h3 className="font-display text-xl font-semibold tracking-tight text-balance">{plan.name}</h3>
      {plan.dailyTime && <p className="type-small -mt-2">{plan.dailyTime}</p>}
      <p className="type-body text-pretty">{plan.description}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <Button
          size="sm"
          variant={featured ? "glow" : "default"}
          onClick={() => {
            actions.startPlan(plan.id);
            nav.go({ view: "plans", planId: plan.id });
          }}
        >
          Start plan
        </Button>
        <Button size="sm" variant="outline" onClick={() => nav.go({ view: "plans", planId: plan.id })}>
          See the days
        </Button>
      </div>
    </Panel>
  );
}

function PlanDetail({ plan, focusDay }: { plan: ReadingPlan; focusDay?: number }) {
  const { data, actions } = useStore();
  const nav = useNav();
  const confirm = useConfirm();
  const progress = data.plans[plan.id];
  const status = planStatus(plan, progress);
  const featured = plan.days.find((item) => item.day === focusDay) ?? status.nextDay ?? plan.days[plan.days.length - 1];
  const pages = Math.ceil(plan.days.length / PAGE_SIZE);
  const [page, setPage] = useState(() => Math.max(0, Math.floor(plan.days.indexOf(featured) / PAGE_SIZE)));
  const visible = useMemo(() => plan.days.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [plan.days, page]);

  const stop = async () => {
    const ok = await confirm({
      title: `Stop ${plan.name}?`,
      body: "Your days in this plan will be cleared. Chapters you read still count toward your Bible progress.",
      confirm: "Stop this plan",
      destructive: true,
    });
    if (ok) actions.stopPlan(plan.id);
  };

  return (
    <div className="flex flex-col gap-10 pt-8">
      <div>
        <button type="button" onClick={() => nav.go({ view: "plans" })} className="type-label group/back inline-flex cursor-pointer items-center gap-2 rounded text-muted-foreground uppercase transition-colors hover:text-sky">
          <ArrowLeft aria-hidden="true" className="size-3.5 transition-transform duration-300 group-hover/back:-translate-x-0.5" />
          All plans
        </button>
      </div>

      <header className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-2xl flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <Chip>{plan.days.length} days</Chip>
            <Chip>{plan.difficulty}</Chip>
            {plan.dailyTime && <Chip>{plan.dailyTime}</Chip>}
          </div>
          <h1 className="type-h1 text-[clamp(2.125rem,4.6vw,3.5rem)] text-balance">{plan.name}</h1>
          <p className="type-lead text-pretty">{plan.description}</p>
          {!progress && (
            <div>
              <Button variant="glow" onClick={() => actions.startPlan(plan.id)}>
                Start this plan
              </Button>
            </div>
          )}
        </div>
        {progress && (
          <div className="flex shrink-0 items-center gap-5 md:flex-col md:gap-3">
            <ProgressRing
              value={status.total ? status.completedCount / status.total : 0}
              size={140}
              display={`${status.completedCount}/${status.total}`}
              caption="days"
              label={`${status.completedCount} of ${status.total} days done`}
            />
            <p className="type-small">{status.finished ? "Every day done" : `Day ${status.nextDay?.day} is next`}</p>
          </div>
        )}
      </header>

      {status.finished && progress ? (
        <Panel surface="glass" ticks className="flex items-start gap-3 p-6">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-positive" />
          <p className="type-body text-foreground">You finished {plan.name}. Well done. Look back over any day below, or choose another plan.</p>
        </Panel>
      ) : (
        <section aria-label={focusDay ? `Day ${featured.day}` : "Up next"}>
          <PlanDayCard plan={plan} day={featured} featured />
        </section>
      )}

      <section aria-labelledby="all-days" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="all-days" className="type-h3">
            All days
          </h2>
          {pages > 1 && (
            <div className="flex items-center gap-2">
              <Button variant="glass" size="icon-sm" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Earlier days">
                <ArrowLeft aria-hidden="true" />
              </Button>
              <span className="type-label min-w-24 text-center text-muted-foreground tabular-nums">
                Days {page * PAGE_SIZE + 1} to {Math.min(plan.days.length, (page + 1) * PAGE_SIZE)}
              </span>
              <Button variant="glass" size="icon-sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} aria-label="Later days">
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
        <ol className="flex flex-col gap-2">
          {visible.map((item) => (
            <li key={item.day}>
              <PlanDayCard plan={plan} day={item} />
            </li>
          ))}
        </ol>
      </section>

      {progress && (
        <div className="border-t border-line pt-6">
          <Button variant="destructive" size="sm" onClick={stop}>
            Stop this plan
          </Button>
        </div>
      )}
    </div>
  );
}

function PlanDayCard({ plan, day, featured = false }: { plan: ReadingPlan; day: PlanDay; featured?: boolean }) {
  const { data, actions } = useStore();
  const nav = useNav();
  const done = isDayDone(data.plans[plan.id], day.day);
  const alreadyRead = !done && dayAlreadyRead(data, day);
  const firstUnread = day.readings.find((reading) => !isRead(data, reading)) ?? day.readings[0];

  return (
    <Panel surface={featured ? "glass" : "solid"} ticks={featured} className={cn("flex gap-4", featured ? "p-6 sm:p-7" : "rounded-2xl p-4 sm:px-5", done && !featured && "bg-card/60 shadow-none")}>
      <span
        aria-hidden="true"
        className={cn(
          "grid shrink-0 place-items-center rounded-xl border font-display font-semibold tabular-nums",
          featured ? "size-12 text-lg" : "size-10 text-sm",
          done ? "border-sky-bright/30 bg-accent text-accent-foreground" : "border-line bg-card/70 text-foreground",
        )}
      >
        {done ? <Check className="size-4" /> : day.day}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="type-label text-[0.625rem] text-muted-foreground">
          {featured && !done ? "Up next, " : ""}Day {day.day}
          <span className="sr-only">{done ? ", completed" : ", not completed"}</span>
        </p>
        <h3 className={cn("font-display font-semibold tracking-tight text-balance", featured ? "text-2xl" : "text-base")}>{day.title ?? formatReadings(day.readings)}</h3>
        {day.title && <p className="type-small">{formatReadings(day.readings)}</p>}
        {day.explanation && <p className={cn("text-pretty", featured ? "type-body" : "type-small")}>{day.explanation}</p>}

        {featured && day.readings.length > 1 && (
          <ul className="flex flex-wrap gap-2 pt-1">
            {day.readings.map((reading) => {
              const read = isRead(data, reading);
              return (
                <li key={`${reading.book}${reading.chapter}`}>
                  <button
                    type="button"
                    onClick={() => nav.go({ view: "bible", ...reading, planId: plan.id, planDay: day.day })}
                    className={cn(
                      "inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-[0.8125rem] font-medium transition-colors duration-300 hover:border-sky-bright",
                      read ? "border-sky-bright/30 bg-accent text-accent-foreground" : "border-line-strong bg-card/70 text-foreground",
                    )}
                  >
                    {read ? <CircleCheck aria-hidden="true" className="size-3.5" /> : <Circle aria-hidden="true" className="size-3.5 text-muted-foreground" />}
                    {formatRef(reading)}
                    <span className="sr-only">{read ? "(read)" : "(not read yet)"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {alreadyRead && (
          <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-positive">
            <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            You&apos;ve already read {day.readings.length > 1 ? "these chapters" : "this chapter"}. You can mark the day complete without reading it again.
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {!done && (
            <Button size={featured ? "default" : "sm"} variant={featured ? "glow" : "outline"} onClick={() => nav.go({ view: "bible", ...firstUnread, planId: plan.id, planDay: day.day })}>
              {alreadyRead ? "Read again" : `Read ${formatRef(firstUnread)}`}
            </Button>
          )}
          {done ? (
            <Button size="sm" variant="ghost" onClick={() => actions.setPlanDay(plan.id, day.day, false, day.readings)}>
              Mark as not done
            </Button>
          ) : (
            <Button size={featured ? "default" : "sm"} variant={featured ? "outline" : "ghost"} onClick={() => actions.setPlanDay(plan.id, day.day, true, day.readings)}>
              <Check aria-hidden="true" />
              Mark day complete
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}
