export interface ShippingProduct {
  weight: number; // kg
  width: number; // cm
  height: number; // cm
  length: number; // cm
  quantity: number;
}

export interface ShippingOption {
  serviceId: number;
  serviceName: string;
  company: string;
  price: number;
  deliveryDays: number;
}

export interface IShippingProvider {
  calculate(
    destinationCep: string,
    products: ShippingProduct[],
  ): Promise<ShippingOption[]>;
}
