import React from 'react';
import Form from './Form';
// import { GET_STEP } from '../resolvers';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const GET_STEP = gql`
	query GetStep {
		step @client
	}
`;

const SET_STEP = gql`
	mutation SetStep($step: Int!) {
		changeStep(step: $step) @client
	}
`;

const Forms = () => {
	const formName = 'form1';

	const { data, loading: stepLoading, error: stepError } = useQuery(GET_STEP);

	const step = data?.step || 0;

	const [mutation, { loading, error }] = useMutation(SET_STEP, {
		variables: { step: step + 1 },
		refetchQueries: [
			{
				query: GET_STEP,
			},
		],
	});

	const submit = step < 3 ? () => mutation() : undefined;

	return <Form formName={formName} step={step} submit={submit} />;
};

export default Forms;
