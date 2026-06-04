
export interface IAutocompleteResponse {
	predictions: Array<{
		address: string,
		placeId: string,
	}>,
}

export interface ILocationResponse {
  placeId?: string;
  latitude: number;
  longitude: number;
}
