import gql from 'graphql-tag';
import { GET_CART_ITEMS } from './pages/cart';
import * as LaunchTileTypes from './pages/__generated__/LaunchTile';
import { ApolloCache } from 'apollo-cache';
import * as GetCartItemTypes from './pages/__generated__/GetCartItems';
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

interface Form {
	id: string;
	fields: [
		{
			name: string;
			value: string | number;
		},
	];
}

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
	},
};
