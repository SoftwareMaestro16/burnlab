import { Address } from "@ton/core";

export let JETTON: Address;

export const setJettonAddress = (address: string) => {
    JETTON = Address.parse(address);
    console.log(address);
    
};

