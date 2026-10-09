// The admin training guide. Shown at /admin/help and exported to docs/ADMIN-GUIDE.md
// (npm run docs:guide). Edit here, then re-run the export.

export type HelpSection = { id: string; title: string; intro?: string; steps?: string[]; tips?: string[] };

export const HELP_INTRO =
  "This guide shows the registrar and ICT team how to look after the Murang'a TTI website. You do not need any technical knowledge: everything is done in the admin area.";

export const HELP: HelpSection[] = [
  {
    id: "signing-in",
    title: "1. Signing in and finding your way",
    steps: [
      "Go to the website address followed by /admin (for example murangatech.ac.ke/admin) and sign in with the email and password you were given.",
      "The menu on the left groups everything: Content (news, pages, notices, timetables, tenders, careers, downloads), Media (photos and files, gallery), Institute (courses, staff), Inbox (applications, messages) and Site (tasks, activity, users, settings).",
      "On a phone, tap Menu at the top to open the same list.",
      "Click your name at the bottom of the menu to change your name or password. Your name is what visitors see in 'Last updated by'.",
      "Always press Sign out when you finish on a shared computer.",
    ],
    tips: ["While you are signed in, a dark bar appears at the top of the public website with an Edit button for the page you are viewing. Use it to fix a mistake the moment you spot it."],
  },
  {
    id: "news",
    title: "2. Posting and editing news",
    steps: [
      "Open News, then press + New post.",
      "Type the title and write the story in the large box. Use the buttons above it for headings, bold, lists, links and photos.",
      "To add a photo inside the story, press Image and pick it from the library (or upload a new one there).",
      "On the right, choose a Cover image, attach any PDF or Word files under Downloads, and set the date if the story is older.",
      "Leave Published ticked and press Publish post. Untick it to save a draft nobody else can see.",
      "To change a post later, open News and click its title. Press Save changes when done.",
    ],
    tips: ["Short summary is optional. If you leave it empty, the first lines of the story are used on the news list."],
  },
  {
    id: "notices",
    title: "3. Notices (E-NOTICE page)",
    steps: [
      "Open Notices, then + New notice.",
      "Write the notice text. Add an image or poster (for example an intake poster) and any files (PDF, Word, Excel).",
      "Notices that show 'Nothing attached' in the list have no image or file. Use the 'Nothing attached' filter to find them, open each one and attach what is missing.",
      "Untick Published to hide a notice without deleting it.",
    ],
  },
  {
    id: "pages",
    title: "4. Department pages and your own pages",
    steps: [
      "Open Pages. The first list is the eight department pages; click one to rewrite its text, change its tagline and choose its photos (the first photo is the banner).",
      "'Discard my edits' puts back the original text if you are not happy.",
      "To make a brand new page (a policy, a partner page, an announcement), press + New page, give it a title and write the content. Its web address is made from the title and you can change it.",
      "Your new page is not added to the menu automatically. Link to it from a news post, or ask your web developer to add it to the menu.",
    ],
    tips: ["Programmes (courses) are not edited here but under Courses."],
  },
  {
    id: "home-site",
    title: "5. Home page, contact details and main pages",
    intro: "Most of the public site can be changed without any help: three places cover almost everything visitors read.",
    steps: [
      "Home page (Content > Home page): the welcome pop-up (and how often it appears), the orange banner, the photo slideshow, the Mission/Vision/Values, the service-charter standards and the bottom call to action. Change the banner and pop-up each time an intake opens or closes.",
      "Site details (Content > Site details): phone, WhatsApp number, email, address, office hours, footer text, social media links and the Admissions headline. Change a number once and it updates the header, footer, contact page, admissions page and every WhatsApp button.",
      "Pages > Main pages: the wording of About us and the Students' Council page.",
      "Partners (Institute > Partners): the logos that scroll above the footer on every page. Add a name and logo, reorder with Up/Down, add a website to make a logo clickable.",
      "Departments: the writing and photos for each department are under Pages > Department pages, and the programmes in each are under Courses.",
    ],
    tips: ["Before every intake, update: the banner, the pop-up, the Admissions headline and the slideshow. That is a five-minute job."],
  },
  {
    id: "media",
    title: "6. The media library: photos and files",
    steps: [
      "Open Media library. Drag photos or documents onto the box, or press choose files. Photos, PDF, Word, Excel and PowerPoint up to 25 MB each are accepted.",
      "Big photos are shrunk automatically so the website stays fast.",
      "Click a file to copy its link, add a description (this helps Google and people using screen readers) or delete it.",
      "Everywhere else on the admin (news, notices, pages, downloads...) you pick files from this same library, so upload once and reuse.",
    ],
    tips: ["Deleting a file removes it from every page that uses it, so check before you delete."],
  },
  {
    id: "records",
    title: "7. Tenders, careers, timetables, downloads, gallery, staff and courses",
    steps: [
      "To add many courses at once: Courses > Import from Excel. Download the template, fill one row per course (Department and Level have drop-down lists), upload it, check the preview, then press Import. 'Download current courses' gives you every course in the same layout to edit in bulk and upload again with Update existing ticked.",
      "Each of these lists has an Add form at the top and an Edit button on every row.",
      "Press Edit to correct a title, replace a file or photo, change a date or move a person to another department. Press Save changes.",
      "Tenders and careers: set the status shown on the website (Open, Closed, or Posted Mar 2025) and attach the notice document.",
      "Downloads: the group decides where it appears on the Downloads page (for example Fees or Forms).",
      "Staff: the department decides which section of the Administration or Staff page the person appears in.",
      "Courses: Edit details changes the name, level, duration, entry requirement and examining body. Edit write-up changes the description and photo shown when a visitor opens the course.",
      "Delete removes the item from the website straight away.",
    ],
  },
  {
    id: "users",
    title: "8. Users and permissions",
    steps: [
      "Administrators open Users to add people, give each one their own email and a temporary password, and choose their role.",
      "Administrator: can do everything, including users and settings. Editor: can write and edit content but cannot open Users or Settings.",
      "Remove a user when they leave. They are locked out immediately.",
      "Never share one login between several people. With separate logins, the Activity page can show who changed what.",
    ],
  },
  {
    id: "activity",
    title: "9. Seeing who changed what",
    steps: [
      "Open Activity to see the latest changes, who made them and when.",
      "Visitors see 'Last updated on [date] by [name]' on news posts and on department and custom pages.",
    ],
  },
  {
    id: "mistakes",
    title: "10. When something looks wrong",
    steps: [
      "Typo or wrong text: use the Edit button on the website bar, or open the item in the admin and fix it.",
      "Wrong photo or file: open the item, press Change on the photo or file, pick the right one and save.",
      "Something should not be public yet: open it and untick Published (or press Unpublish on the News list).",
      "Deleted by mistake: deleted items cannot be brought back from the admin. Check Activity to see what was deleted and re-create it, and tell your web developer so a database backup can be restored if it matters.",
      "Forgot your password: on the sign-in page click 'Forgot your password?', enter your email and open the link we send you (valid for 1 hour, works once). If no email arrives, check spam, or ask an administrator to set a new password for you under Users. If no administrator can sign in, contact your web developer.",
      "Anything else (broken page, error message): take a screenshot, note the page address, and send it to your web developer.",
    ],
  },
  {
    id: "good-habits",
    title: "11. Good habits",
    steps: [
      "Use a long, unique password and change the one you were given.",
      "Give photos a short description in the media library.",
      "Check each new post on the website after publishing.",
      "Keep one trusted person responsible for tenders and careers, as these have legal deadlines.",
      "Tasks in the admin lists what is still to be completed on the site. Tick items off as they are done.",
    ],
  },
];
