import { CategoryPreference, } from '@prisma/client'

export const PREFERENCE_DICTIONARY = [
	{
		category:    CategoryPreference.PHOTOGRAPHY,
		name:        'Elevate External',
		description: 'Captures the property from a higher angle to avoid obstructions like parked cars, showcasing the building in its entirety and the surrounding area for a more impressive view.',
	},
	{
		category:    CategoryPreference.PHOTOGRAPHY,
		name:        '2x Portrait Photos',
		description: 'Shooting in portrait orientation to better fit the format of mobile screens, optimising the content for viewers on smartphones and enhancing the visual experience on social media and property listing apps.',
	},
	{
		category:    CategoryPreference.PHOTOGRAPHY,
		name:        'Wide-Angle Shots (12mm)',
		description: 'Utilising a 12mm wide-angle lens to capture more of the room\'s details and give a sense of spaciousness, ideal for smaller rooms to make them appear larger our standared is 16mm',
	},

	{
		category:    CategoryPreference.PHOTOGRAPHY,
		name:        '2 x Detail Shots',
		description: 'Focusing on unique details of the property, such as architectural features, high-quality materials, or bespoke fittings, to highlight the luxury or unique selling points of the property.',
	},

	{
		category:    CategoryPreference.PHOTOGRAPHY,
		name:        'Blur Personal Photos',
		description: 'Blur personal photos and identifiable items within the property photos, ensuring privacy and focusing viewers\' attention on the property\'s features rather than personal belongings.',
	},

	{
		category:    CategoryPreference.VIDEO,
		name:        'Slow',
		description: 'Shooting in slow motion to capture the property\'s features in a more detailed and cinematic way, ideal for showcasing the property\'s features in a more immersive way.',
	},

	{
		category:    CategoryPreference.VIDEO,
		name:        'Fast',
		description: 'Shooting in fast motion to capture the property\'s features in a more dynamic and engaging way, ideal for showcasing the property\'s features in a more immersive way.',
	},

	{
		category:    CategoryPreference.VIDEO,
		name:        'Property Address Intro',
		description: 'Include an elegant display of the property\'s address at the beginning of every video, providing a professional introduction and reinforcing the property\'s identity.',
	},

	{
		category:    CategoryPreference.VIDEO,
		name:        'Blur Personal Photos',
		description: 'Implement a subtle blur effect on personal items or photos during video tours, maintaining the property\'s appeal while respecting the privacy of current occupants.',
	},

	{
		category:    CategoryPreference.FLOORPLAN,
		name:        'Coloured Floorplans',
		description: 'Uses different colours to distinguish between room types (e.g., living areas, bathrooms, outdoor spaces), improving readability and helping viewers to quickly understand the layout.',
	},

	{
		category:    CategoryPreference.FLOORPLAN,
		name:        'Black and white ',
		description: 'A black and white floorplan template option that emphasises clarity and detail, allowing for easy interpretation and a professional presentation that fits any marketing material.',
	},

	{
		category:    CategoryPreference.FLOORPLAN,
		name:        'Enhanced Accessibility Features',
		description: 'Highlight accessible features such as wider doorways, ramps, and no-step entries on floorplans for properties that accommodate or specialise in accessibility, appealing to a broader audience.',
	},

	{
		category:    CategoryPreference.EDITING,
		name:        'Standard',
		description: 'Provides a clean, realistic representation of the property, with balanced colours and lighting that accurately reflects how the property looks in person.',
	},

	{
		category:    CategoryPreference.EDITING,
		name:        'Magazine',
		description: 'Emphasises natural light and soft tones, presenting the property in a light that is true to life, ideal for creating a warm, inviting atmosphere.',
	},

	{
		category:    CategoryPreference.EDITING,
		name:        'Dexters',
		description: 'Brand specific',
	},

	{
		category:    CategoryPreference.EDITING,
		name:        'Blue Skies Editing',
		description: 'Ensures outdoor shots always have bright, blue skies, giving a more attractive and consistent look to property listings, even if the original photos were taken on overcast days.',
	},
]