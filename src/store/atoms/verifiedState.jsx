import { atom } from "recoil";

export const verifiedState = atom({
  key: 'verifiedState',
  default: false,
});