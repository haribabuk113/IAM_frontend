<script>
  import { provider_icons } from "$lib/provider_icons.js";
  import Icon from "./icon.svelte";
  export let link;
  $: slug = {
    LinkedIn: "linkedin_oidc",
    GitHub: "github",
    Facebook: "facebook",
    Microsoft: "azure",
    X: "twitter",
    Google: "google",
  }[link.platform];
</script>

<a
  class="profile_social_icon"
  href={link.url}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={link.platform}
  title={link.platform}
  >{#if slug}<span>{@html provider_icons[slug]}</span
    >{:else if link.platform === "Behance"}<strong aria-hidden="true">Bē</strong
    >{:else if link.platform === "Dribbble"}<svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      ><circle cx="12" cy="12" r="9" /><path
        d="M7 4c5 6 8 11 9 16M3 11c8 0 12-2 16-6M5 19c4-8 9-9 16-6"
      /></svg
    >{:else}<Icon name={link.icon || "globe"} size={20} />{/if}</a
>
