import gql from 'graphql-tag';
import { GET_CART_ITEMS } from './pages/cart';
import * as LaunchTileTypes from './pages/__generated__/LaunchTile';
import { ApolloCache } from 'apollo-cache';
import * as GetCartItemTypes from './pages/__generated__/GetCartItems';
import { GetLaunchList_launches_launches } from './pages/__generated__/GetLaunchList';
import { Resolvers } from 'apollo-client';

export const typeDefs = gql`
	scalar Any

	type FormField {
		name: String!
		value: Any
	}

	type Form {
		id: String!
		fields: [FormField]
	}

	extend type Query {
		isLoggedIn: Boolean!
		cartItems: [ID!]!
		step: Int!
		forms: [Form]!
		getForm(id: String!): Form
		getLaunch(id: String!): Launch
	}

	extend type Launch {
		isInCart: Boolean!
	}

	extend type Mutation {
		addOrRemoveFromCart(id: ID!): [ID!]!
		changeStep(step: number!): number
		setForm(id: String!): Form
	}
`;

type ResolverFn = (
	parent: any,
	args: any,
	{ cache }: { cache: ApolloCache<any> },
) => any;

interface ResolverMap {
	[field: string]: ResolverFn;
}

interface AppResolvers extends Resolvers {
	Launch: ResolverMap;
	Mutation: ResolverMap;
}

export const GET_STEP = gql`
	query GetStep {
		step @client
	}
`;

const GET_FORMS = gql`
	query {
		forms @client {
			id
			fields {
				name
				value
			}
		}
	}
`;

const GET_FORM = gql`
	query GET_FORM($id: String!) {
		getForm(id: $id) @client {
			id
			fields {
				name
				value
			}
		}
	}
`;
interface Form {
	id: string;
	fields: [
		{
			name: string;
			value: string | number;
		},
	];
}

const LAUNCH_FRAG = gql`
	fragment myLaunch on Launch {
		id
		isBooked
		rocket {
			id
			name
		}
	}
`;

export const resolvers: AppResolvers = {
	Query: {
		getForm: (_, { id }, { cache }): Form | undefined => {
			const queryResult = cache.readQuery({
				query: GET_FORMS,
			});

			if (queryResult) {
				return queryResult.forms.find((form: Form) => form.id === id);
			}

			return undefined;
		},
		getLaunch: (_, { id }, { cache }) => {
			const queryResult = cache.readFragment({
				id: `Launch:${id}`,
				fragment: LAUNCH_FRAG,
			});
			return queryResult || {};
		},
	},
	Launch: {
		isInCart: (
			launch: LaunchTileTypes.LaunchTile,
			_,
			{ cache },
		): boolean => {
			const queryResult = cache.readQuery<GetCartItemTypes.GetCartItems>({
				query: GET_CART_ITEMS,
			});
			// console.log({ queryResult });
			if (queryResult) {
				return queryResult.cartItems.includes(launch.id);
			}
			return false;
		},
	},
	Mutation: {
		addOrRemoveFromCart: (
			_,
			{ id }: { id: string },
			{ cache },
		): string[] => {
			const queryResult = cache.readQuery<GetCartItemTypes.GetCartItems>({
				query: GET_CART_ITEMS,
			});
			if (queryResult) {
				const { cartItems } = queryResult;
				const data = {
					cartItems: cartItems.includes(id)
						? cartItems.filter((i) => i !== id)
						: [...cartItems, id],
				};
				cache.writeQuery({ query: GET_CART_ITEMS, data });
				return data.cartItems;
			}
			return [];
		},
		changeStep: (_, { step }: { step: number }, { cache }): number => {
			cache.writeQuery({ query: GET_STEP, data: { step } });
			return step;
		},
		// dont update forms
		// setForm: (_, { id, fields }: Form, { cache }) => {
		// 	const getForm = {
		// 		__typename: 'Form',
		// 		id,
		// 		fields: fields.map((field) => ({
		// 			__typename: 'FormField',
		// 			...field,
		// 		})),
		// 	};

		// 	cache.writeQuery({
		// 		query: GET_FORM,
		// 		variables: {
		// 			id,
		// 		},
		// 		data: {
		// 			getForm,
		// 		},
		// 	});

		// 	return getForm;
		// },
		setForm: (_, { id, fields }: Form, { cache }) => {
			const getForm = {
				__typename: 'Form',
				id,
				fields: fields.map((field) => ({
					__typename: 'FormField',
					...field,
				})),
			};

			const queryResult = cache.readQuery({
				query: GET_FORMS,
			}) as any;
			if (queryResult) {
				const { forms } = queryResult;
				const index = forms.findIndex(
					(form: { id: string }) => form.id === id,
				);
				const newForm = {
					__typename: 'Form',
					id,
					fields: fields.map((field) => ({
						__typename: 'FormField',
						...field,
					})),
				};

				const oldForms = JSON.parse(JSON.stringify(forms));
				let data;
				if (index > -1) {
					data = oldForms;
					data[index] = newForm;
				} else {
					data = [...oldForms, newForm];
				}

				cache.writeQuery({
					query: GET_FORMS,
					data: {
						forms: data,
					},
				});
				return data;
			}
			return [];
		},
	},
};
