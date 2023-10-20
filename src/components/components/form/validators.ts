import React from 'react';

export type ValidatorType<ValueType = unknown> = (
  value: ValueType
) => Promise<string | undefined> | string | undefined;

export type ValidatorFactoryType<ValueType = unknown> = (
  message: React.ReactNode
) => ValidatorType<ValueType>;

export type ValidatedInput<InputType, ValueType> = InputType & {
  /** Funzione o array di funzioni per la validazione */
  validate?:
    | ValidatorFactoryType<ValueType>
    | ValidatorFactoryType<ValueType>[];
  /** Messaggio di errore */
  errorMessage?: string | string[] | null;
  /** Callback onChange @deprecated */
  changed?: (data: ValueType) => void;
  size?: 'small' | 'medium' | 'large';
  /** Se true, l'input è disabilitato */
  disabled?: boolean;
};

export const required: ValidatorFactoryType =
  <ValueType>(message: React.ReactNode) =>
  (v: ValueType) =>
    (!v || (Array.isArray(v) && (v as any).length === 0)
      ? message
      : undefined) as string;

export const composeValidators =
  <ValueType>(
    validators?:
      | ValidatorFactoryType<ValueType>
      | ValidatorFactoryType<ValueType>[],
    errorMessages?: string | string[] | null
  ): ValidatorType<ValueType> =>
  (value) => {
    if (!validators) {
      return undefined;
    }
    if (!Array.isArray(validators)) {
      validators = [validators];
    }
    if (!errorMessages) {
      errorMessages = validators.map((_v) => ' ');
    }
    if (!Array.isArray(errorMessages)) {
      errorMessages = [errorMessages];
    }
    let msg = '';
    for (let i = 0; i < validators.length; i++) {
      const result = validators[i](errorMessages[i] || ' ')(value);
      msg += result ? result : '';
    }
    return msg.length === 0 ? undefined : msg.trim();
  };

export const validateFiscalCode: ValidatorFactoryType =
  <ValueType>(message: React.ReactNode) =>
  (v: ValueType) => {
    if (!v) {
      return message as string;
    } else {
      //controllo codice fiscale
      let codiceValido = validaCodiceFiscale(v as string);
      if (!codiceValido) {
        return 'Codice Fiscale non valido';
      } else {
        return undefined;
      }
    }
  };

export const validatePI = (pi: string): boolean => {
  pi = normalize(pi);
  if (pi.length === 0) return false;
  else if (pi.length !== 11) return false;
  if (!/^[0-9]{11}$/.test(pi)) return false;
  var s = 0;
  for (var i = 0; i < 11; i++) {
    var n = pi.charCodeAt(i) - '0'.charCodeAt(0);
    if ((i & 1) === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    s += n;
  }
  if (s % 10 !== 0) return false;
  return true;
};

export const normalize = (cf: string): string => {
  return cf.replace(/\s/g, '');
};

export const validaCodiceFiscale = (cf: string): boolean => {
  var validi, i, s, set1, set2, setpari, setdisp;
  if (cf == '') return false;
  cf = cf.toUpperCase();
  if (cf.length != 16) {
    return validatePI(cf);
  }
  validi = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (i = 0; i < 16; i++) {
    if (validi.indexOf(cf.charAt(i)) == -1) {
      return validatePI(cf);
    }
  }
  set1 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  set2 = 'ABCDEFGHIJABCDEFGHIJKLMNOPQRSTUVWXYZ';
  setpari = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  setdisp = 'BAKPLCQDREVOSFTGUHMINJWZYX';
  s = 0;
  for (i = 1; i <= 13; i += 2)
    s += setpari.indexOf(set2.charAt(set1.indexOf(cf.charAt(i))));
  for (i = 0; i <= 14; i += 2)
    s += setdisp.indexOf(set2.charAt(set1.indexOf(cf.charAt(i))));
  if (s % 26 != cf.charCodeAt(15) - 'A'.charCodeAt(0)) {
    return validatePI(cf);
  }
  return true;
};
