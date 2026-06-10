const QOSMO_ORIGIN = import.meta.env.DEV
  ? "/qosmo"
  : "https://qosmo.telkom.co.id";

export const qosmoUrl = (path: string) => {
  if (!path.startsWith("/")) {
    return `${QOSMO_ORIGIN}/${path}`;
  }

  return `${QOSMO_ORIGIN}${path}`;
};

