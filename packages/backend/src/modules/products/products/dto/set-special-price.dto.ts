export interface SetSpecialPriceDto {
    targetId: string;
    targetType: 'B2B' | 'B2C' | 'Subbrand';
    productTypeId: string;
    price: number;
}