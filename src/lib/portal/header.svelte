<script>
  import { page } from "$app/stores";
  import { onMount as on_mount } from "svelte";
  import Logo from "./logo.svelte";
  import Icon from "./icon.svelte";
  let menu_open = false;
  let nav_root;
  const groups = [
    {
      name: "Career",
      links: [
        ["My profile", "/profile"],
        ["Applications", "/applications"],
      ],
    },
    {
      name: "Jobs",
      links: [
        ["Search jobs", "/jobs"],
        ["Saved jobs", "/saved-jobs"],
        ["Post a job", "/recruiter/post-job"],
        ["Hiring workspace", "/recruiter"],
      ],
    },
    {
      name: "Companies",
      links: [
        ["Explore companies", "/companies"],
        ["Create a company", "/company/create"],
        ["My company", "/company/forma/dashboard"],
      ],
    },
    {
      name: "About",
      links: [
        ["Our approach", "/about"],
        ["FAQs", "/faq"],
        ["Contact us", "/contact"],
      ],
    },
  ];
  $: current_path = $page.url.pathname;
  $: if (current_path) {
    menu_open = false;
    nav_root
      ?.querySelectorAll("details[open]")
      .forEach((el) => el.removeAttribute("open"));
  }
  on_mount(() => {
    const dismiss = (event) => {
      nav_root.querySelectorAll("details[open]").forEach((el) => {
        if (
          event.key === "Escape" ||
          (event.type === "click" &&
            (!el.contains(event.target) || event.target.closest("a")))
        ) {
          el.removeAttribute("open");
          if (event.key === "Escape") el.querySelector("summary").focus();
        }
      });
      if (event.key === "Escape") menu_open = false;
    };
    document.addEventListener("click", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("click", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  });
</script>

<a class="skip_link" href="#main-content">Skip to content</a>
<header class="unified_header" bind:this={nav_root}>
  <div class="unified_nav">
    <a href="/" aria-label="Referise home" class="unified_brand"><Logo /></a>
    <nav class="unified_desktop" aria-label="Main navigation">
      <a href="/" aria-current={current_path === "/" ? "page" : undefined}
        >Home</a
      >
      {#each groups as group}<details class="unified_dropdown">
          <summary>{group.name}<Icon name="chevron-down" size={13} /></summary>
          <div>
            {#each group.links as [label, href]}<a
                {href}
                aria-current={current_path === href ? "page" : undefined}
                >{label}<Icon name="arrow-up-right" size={14} /></a
              >{/each}
          </div>
        </details>{/each}
    </nav>
    <div class="unified_actions">
      <a class="unified_signin" href="/login">Sign in</a><a
        class="unified_post"
        href="/recruiter/post-job">Post a job <Icon name="plus" size={16} /></a
      >
      <button
        class="unified_toggle"
        aria-label={menu_open ? "Close navigation" : "Open navigation"}
        aria-expanded={menu_open}
        aria-controls="unified_mobile"
        on:click={() => (menu_open = !menu_open)}
        ><Icon name={menu_open ? "close" : "menu"} /></button
      >
    </div>
  </div>
  {#if menu_open}<nav
      id="unified_mobile"
      class="unified_mobile"
      aria-label="Mobile navigation"
    >
      <a href="/">Home</a>
      {#each groups as group}<details>
          <summary>{group.name}<Icon name="plus" size={16} /></summary>
          <div>
            {#each group.links as [label, href]}<a {href}
                >{label}<Icon name="arrow-right" size={15} /></a
              >{/each}
          </div>
        </details>{/each}
      <div class="mobile_account">
        <a href="/login">Sign in</a><a href="/signup">Create an account</a>
      </div>
    </nav>{/if}
</header>
