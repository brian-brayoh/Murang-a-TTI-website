// Pages whose wording is built in but editable from Admin > Pages.
export const BUILTIN: Record<string, { name: string; path: string; heading: string; html: string }> = {
  about: {
    name: "About us",
    path: "/about",
    heading: "Built on the workshop floor, since day one.",
    html:
      "<p>Murang'a Technical Training Institute trains technicians, engineers, entrepreneurs and hospitality professionals through competency-based education and training (CBET). Programmes run from certificate through diploma level across seven departments, each built around live workshop and studio practice rather than classroom theory alone.</p>" +
      "<p>The institute works with national bodies including KNEC, TVETA, TVET CDACC and KUCCPS, and partners with employers such as Safaricom to keep training aligned with what industry actually needs. HELB-funded study is available to eligible trainees.</p>" +
      "<p>Recognition of Prior Learning (RPL) is offered year-round, so trainees who have gained skills informally or on the job can have that experience assessed and credited toward a recognised qualification.</p>",
  },
  "students-council": {
    name: "Students' Council",
    path: "/students-council",
    heading: "MUTSA — student leadership",
    html:
      "<p>The Murang'a TTI Students' Association (MUTSA) represents trainee interests to the administration, organises campus activities, and runs elections annually across all seven departments.</p>",
  },
};
