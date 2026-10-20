<script>
  import { onMount as on_mount } from "svelte";
  import Modal from "./modal.svelte";
  import Icon from "./icon.svelte";
  let installed = false;
  let prompt_event;
  let help = false;
  on_mount(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const update = () =>
      (installed = media.matches || !!navigator["standalone"]);
    const ready = (event) => {
      event.preventDefault();
      prompt_event = event;
    };
    const complete = () => {
      prompt_event = null;
      update();
    };
    update();
    media.addEventListener("change", update);
    window.addEventListener("beforeinstallprompt", ready);
    window.addEventListener("appinstalled", complete);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("beforeinstallprompt", ready);
      window.removeEventListener("appinstalled", complete);
    };
  });
  async function install() {
    if (!prompt_event) {
      help = true;
      return;
    }
    await prompt_event.prompt();
    await prompt_event.userChoice;
    prompt_event = null;
  }
</script>

<button
  class="install_app"
  disabled={installed}
  on:click={install}
  title={installed ? "You’re using the installed app" : "Install Referise"}
  aria-label={installed ? "App installed" : "Install Referise"}
  ><Icon name="download" size={17} /><span
    >{installed ? "Installed" : "Install app"}</span
  ></button
>
{#if help}<Modal
    title="Keep your next move close."
    on:close={() => (help = false)}
    ><p>
      Install Referise for a separate app window and a shortcut on your home
      screen.
    </p>
    <ol class="install_steps">
      <li>
        <strong>iPhone or iPad:</strong> open this site in Safari, tap Share, then
        Add to Home Screen.
      </li>
      <li>
        <strong>Android:</strong> open the browser menu and choose Install app or
        Add to Home screen.
      </li>
      <li>
        <strong>Desktop:</strong> use the install icon in the address bar, or the
        browser’s app menu.
      </li>
    </ol>
    <p class="small_text">
      If you already installed it, open Referise from your app launcher. Opening
      shared links in the app depends on your browser and operating system
      settings.
    </p></Modal
  >{/if}
