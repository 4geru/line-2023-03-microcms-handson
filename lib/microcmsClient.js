import { createClient } from 'microcms-js-sdk';

export const createMicrocmsClient = ({serviceDomain, apiKey}) => {
  return createClient({
    serviceDomain: serviceDomain,
    apiKey: apiKey
  });
}