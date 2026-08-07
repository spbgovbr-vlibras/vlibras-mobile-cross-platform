import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { SocialSharing } from '@ionic-native/social-sharing/';

import { Strings } from 'components/Player/Strings';

function errMsg(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const raw = reader.result as string;
      const comma = raw.indexOf(',');
      resolve(comma >= 0 ? raw.slice(comma + 1) : raw);
    };
    reader.onerror = () => reject(new Error('FileReader falhou'));
    reader.readAsDataURL(blob);
  });
}

async function writeVideoToCache(blob: Blob): Promise<string> {
  const base64data = await blobToBase64(blob);

  const writeResult = await Filesystem.writeFile({
    path: Strings.VIDEO_SHARE_FILENAME,
    data: base64data,
    directory: Directory.Cache,
    recursive: true,
  });

  let fileUrl = writeResult.uri;
  if (!fileUrl.startsWith('file://')) {
    const uriResult = await Filesystem.getUri({
      path: Strings.VIDEO_SHARE_FILENAME,
      directory: Directory.Cache,
    });
    fileUrl = uriResult.uri;
  }

  if (!fileUrl.startsWith('file://')) {
    throw new Error(`URI inválida após writeFile/getUri: ${fileUrl}`);
  }

  return fileUrl;
}

/**
 * Tenta abrir o sheet nativo de compartilhamento. Ordem:
 * 1) @capacitor/share (files)
 * 2) cordova-plugin-x-socialsharing (shareWithOptions)
 * 3) SocialSharing.share com variações de path
 */
async function openNativeShareSheet(fileUrl: string): Promise<void> {
  const failures: string[] = [];

  try {
    await Share.share({
      dialogTitle: Strings.VIDEO_SHARE_TITLE_DIALOG,
      title: Strings.VIDEO_SHARE_TITLE_DIALOG,
      files: [fileUrl],
    });
    console.log('[VLibras Share] Share OK via @capacitor/share');
    return;
  } catch (error) {
    failures.push(`CapacitorShare: ${errMsg(error)}`);
  }

  try {
    await SocialSharing.shareWithOptions({
      files: [fileUrl],
      chooserTitle: Strings.VIDEO_SHARE_TITLE_DIALOG,
      subject: Strings.VIDEO_SHARE_TITLE_DIALOG,
    });
    console.log('[VLibras Share] Share OK via SocialSharing.shareWithOptions');
    return;
  } catch (error) {
    failures.push(`SocialSharing.options: ${errMsg(error)}`);
  }

  const barePath = fileUrl.replace(/^file:\/\//, '');
  const pathCandidates = [fileUrl, barePath, `file://${barePath}`];

  for (const path of pathCandidates) {
    try {
      await SocialSharing.share('', Strings.VIDEO_SHARE_TITLE_DIALOG, path);
      console.log('[VLibras Share] Share OK via SocialSharing.share path=', path.slice(0, 48));
      return;
    } catch (error) {
      failures.push(`SocialSharing.share: ${errMsg(error)}`);
    }
  }

  throw new Error(failures.join(' | '));
}

export async function shareBlobOnWeb(blob: Blob): Promise<void> {
  const mime = blob.type.includes('video') ? blob.type : 'video/mp4';
  const file = new File([blob], Strings.VIDEO_SHARE_FILENAME, { type: mime });

  if (typeof navigator.share === 'function') {
    try {
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: Strings.VIDEO_SHARE_TITLE_DIALOG,
        });
        return;
      }
    } catch (error) {
      const msg = errMsg(error);
      if (/abort|cancel/i.test(msg)) return;
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = Strings.VIDEO_SHARE_FILENAME;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
}

export async function shareBlobNative(blob: Blob): Promise<void> {
  const fileUrl = await writeVideoToCache(blob);
  console.log('[VLibras Share] Arquivo pronto para share:', fileUrl, 'bytes:', blob.size);
  await openNativeShareSheet(fileUrl);
}

export async function deliverShareableVideo(blob: Blob): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await shareBlobNative(blob);
  } else {
    await shareBlobOnWeb(blob);
  }
}
