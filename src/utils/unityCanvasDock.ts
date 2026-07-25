import UnityService from 'services/unity';

/** Ponto fixo no Player onde o wrapper Unity deve ficar quando não está no mini player. */
export const UNITY_HOME_MOUNT_ID = 'vlibras-unity-home-mount';

const STYLE_PROPS = [
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'zIndex',
] as const;

type TransplantState = {
  host: HTMLElement;
  placeholder: Comment;
  originalParent: HTMLElement;
  originalNextSibling: ChildNode | null;
  previousStyles: { width: string; height: string; position: string };
};

/** Sessão ativa de transplante — sobrevive a re-renders e evita restore/transplant duplicados. */
let activeTransplant: TransplantState | null = null;

let resizeTimer: number | null = null;

export function getUnityWrapper(): HTMLElement | null {
  const unityContent: any = UnityService.getPlayerInstance().getUnity();
  if (!unityContent?.uniqueID) return null;
  const node = document.getElementById(
    `__ReactUnityWebGL_${unityContent.uniqueID}__`
  );
  return node instanceof HTMLElement ? node : null;
}

export function isUnityTransplanted(): boolean {
  return activeTransplant !== null;
}

export function resetUnityWrapperStyles(): void {
  const wrapper = getUnityWrapper();
  if (!wrapper) return;
  STYLE_PROPS.forEach((prop) => {
    wrapper.style[prop] = '';
  });
}

export function notifyUnityResize(): void {
  if (resizeTimer !== null) {
    window.clearTimeout(resizeTimer);
  }
  resizeTimer = window.setTimeout(() => {
    resizeTimer = null;
    window.dispatchEvent(new Event('resize'));
  }, 80);
}

function getHomeMount(): HTMLElement | null {
  const mount = document.getElementById(UNITY_HOME_MOUNT_ID);
  if (mount instanceof HTMLElement) return mount;
  const fallback = document.querySelector('.player-avatar-wrapper');
  return fallback instanceof HTMLElement ? fallback : null;
}

/** Garante que o wrapper está no mount da Home (idempotente). */
export function ensureUnityInHomeMount(): boolean {
  const wrapper = getUnityWrapper();
  const mount = getHomeMount();
  if (!wrapper || !mount) return false;

  if (!mount.contains(wrapper)) {
    mount.appendChild(wrapper);
  }

  resetUnityWrapperStyles();
  notifyUnityResize();
  return true;
}

/** Restaura o wrapper ao Player. Seguro chamar várias vezes. */
export function restoreUnityTransplant(): boolean {
  const wrapper = getUnityWrapper();

  if (activeTransplant && wrapper) {
    const state = activeTransplant;
    activeTransplant = null;

    wrapper.style.width = state.previousStyles.width;
    wrapper.style.height = state.previousStyles.height;
    wrapper.style.position = state.previousStyles.position;

    const anchorParent = state.placeholder.parentNode;
    if (anchorParent) {
      anchorParent.insertBefore(wrapper, state.placeholder);
      anchorParent.removeChild(state.placeholder);
    } else if (state.originalParent) {
      if (
        state.originalNextSibling &&
        state.originalNextSibling.parentNode === state.originalParent
      ) {
        state.originalParent.insertBefore(wrapper, state.originalNextSibling);
      } else {
        state.originalParent.appendChild(wrapper);
      }
    }
  } else {
    activeTransplant = null;
  }

  return ensureUnityInHomeMount();
}

/** @deprecated Use restoreUnityTransplant */
export function recoverUnityToPlayer(): void {
  restoreUnityTransplant();
}

/** Move o wrapper para o host visível do mini player (appendChild). */
export function transplantUnityToHost(host: HTMLElement): boolean {
  const wrapper = getUnityWrapper();
  if (!wrapper) return false;

  if (activeTransplant?.host === host && host.contains(wrapper)) {
    return true;
  }

  if (activeTransplant) {
    restoreUnityTransplant();
  }

  resetUnityWrapperStyles();

  const originalParent = wrapper.parentElement;
  if (!originalParent) return false;

  const originalNextSibling = wrapper.nextSibling;
  const placeholder = document.createComment('vlibras-unity-anchor');
  originalParent.insertBefore(placeholder, wrapper);

  const previousStyles = {
    width: wrapper.style.width,
    height: wrapper.style.height,
    position: wrapper.style.position,
  };

  wrapper.style.width = '100%';
  wrapper.style.height = '100%';
  wrapper.style.position = 'relative';
  host.appendChild(wrapper);

  activeTransplant = {
    host,
    placeholder,
    originalParent,
    originalNextSibling,
    previousStyles,
  };

  notifyUnityResize();
  return true;
}
