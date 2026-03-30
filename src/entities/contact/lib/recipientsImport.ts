export type ContactImportFileType = 'csv' | 'txt' | 'excel';
export type ContactImportExtension = 'csv' | 'txt' | 'xls' | 'xlsx';

export const MAX_IMPORT_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const IMPORT_FILE_HINT = 'Форматы: csv, txt, xls, xlsx. Максимальный размер: 20 Мб.';
export const IMPORT_FILE_INVALID_FORMAT_ERROR = 'Поддерживаются только файлы: csv, txt, xls, xlsx';
export const IMPORT_FILE_SIZE_ERROR = 'Размер файла не должен превышать 20 Мб';
export const IMPORT_FILE_READ_ERROR = 'Не удалось прочитать файл';
export const IMPORT_FILE_EMPTY_ERROR = 'Файл пустой';
export const IMPORT_RECIPIENTS_EMPTY_ERROR =
  'Укажите хотя бы один корректный email или загрузите файл';
export const IMPORT_FILE_PREVIEW_FALLBACK_NOTE =
  'Не удалось распознать email в файле для предпросмотра. Импорт произойдет из файла.';

export const buildMergedRecipientsNote = (count: number): string =>
  `Из файла добавлено ${count} email в список.`;

const allowedImportExtensions: ContactImportExtension[] = ['csv', 'txt', 'xls', 'xlsx'];

export const parseRecipients = (raw: string): string[] => {
  const tokens = raw
    .split(/[\n,;\s]+/g)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(tokens));
};

export const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const extractEmails = (raw: string): string[] =>
  Array.from(
    new Set(
      (raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []).map((email) =>
        email.toLowerCase()
      )
    )
  );

export const getImportFileExtension = (fileName: string): string =>
  fileName.split('.').pop()?.trim().toLowerCase() || '';

export const isAllowedImportExtension = (value: string): value is ContactImportExtension =>
  allowedImportExtensions.includes(value as ContactImportExtension);

export const getImportFileType = (extension: ContactImportExtension): ContactImportFileType => {
  if (extension === 'txt') {
    return 'txt';
  }

  if (extension === 'csv') {
    return 'csv';
  }

  return 'excel';
};

export const formatFileSizeMb = (size: number): string => `${(size / (1024 * 1024)).toFixed(2)} Мб`;

export const validateRecipientsImportFile = (
  file: File
): { extension?: ContactImportExtension; error?: string } => {
  const extension = getImportFileExtension(file.name);
  if (!isAllowedImportExtension(extension)) {
    return { error: IMPORT_FILE_INVALID_FORMAT_ERROR };
  }

  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    return { error: IMPORT_FILE_SIZE_ERROR };
  }

  return { extension };
};

export const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('invalid_file_data'));
        return;
      }

      const parts = reader.result.split(',');
      const base64 = parts[1] || '';
      resolve(base64);
    };

    reader.onerror = () => reject(new Error('file_read_failed'));
    reader.readAsDataURL(file);
  });

const readFileAsText = async (file: File, extension: ContactImportExtension): Promise<string> => {
  if (extension === 'csv' || extension === 'txt') {
    return file.text();
  }

  const arrayBuffer = await file.arrayBuffer();
  return new TextDecoder('utf-8').decode(arrayBuffer);
};

export interface IPreviewRecipientsImportFileResult {
  extension?: ContactImportExtension;
  mergedRecipientsText?: string;
  mergedCount: number;
  note?: string;
  error?: string;
}

export const previewRecipientsImportFile = async ({
  file,
  currentRecipients,
}: {
  file: File;
  currentRecipients: string;
}): Promise<IPreviewRecipientsImportFileResult> => {
  const validation = validateRecipientsImportFile(file);
  if (validation.error || !validation.extension) {
    return { mergedCount: 0, error: validation.error || IMPORT_FILE_INVALID_FORMAT_ERROR };
  }

  const extension = validation.extension;

  try {
    const rawText = await readFileAsText(file, extension);
    const fileRecipients = extractEmails(rawText).filter(isEmail);

    if (fileRecipients.length === 0) {
      return {
        extension,
        mergedRecipientsText: currentRecipients,
        mergedCount: 0,
        note: IMPORT_FILE_PREVIEW_FALLBACK_NOTE,
      };
    }

    const existingRecipients = parseRecipients(currentRecipients).filter(isEmail);
    const mergedRecipients = Array.from(new Set([...existingRecipients, ...fileRecipients]));

    return {
      extension,
      mergedRecipientsText: mergedRecipients.join('\n'),
      mergedCount: fileRecipients.length,
    };
  } catch {
    return {
      extension,
      mergedRecipientsText: currentRecipients,
      mergedCount: 0,
      note: IMPORT_FILE_PREVIEW_FALLBACK_NOTE,
    };
  }
};

export interface IPreparedRecipientsImportFilePayload {
  file_data: string;
  file_type: ContactImportFileType;
}

export const prepareRecipientsImportFilePayload = async ({
  file,
  extension,
}: {
  file: File;
  extension?: string | null;
}): Promise<{ payload?: IPreparedRecipientsImportFilePayload; error?: string }> => {
  const resolvedExtension = extension || getImportFileExtension(file.name);
  if (!isAllowedImportExtension(resolvedExtension)) {
    return { error: IMPORT_FILE_INVALID_FORMAT_ERROR };
  }

  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    return { error: IMPORT_FILE_SIZE_ERROR };
  }

  try {
    const fileData = await readFileAsBase64(file);
    if (!fileData) {
      return { error: IMPORT_FILE_EMPTY_ERROR };
    }

    return {
      payload: {
        file_data: fileData,
        file_type: getImportFileType(resolvedExtension),
      },
    };
  } catch {
    return { error: IMPORT_FILE_READ_ERROR };
  }
};

export const shouldImportFileAfterPreview = ({
  mergedCount,
  extension,
}: {
  mergedCount: number;
  extension?: string | null;
}): boolean => mergedCount === 0 || extension === 'xls' || extension === 'xlsx';
