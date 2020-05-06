import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input, Select } from './htmlTag';
import { DevTool } from 'react-hook-form-devtools';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

interface Props {
	formName: string;
	step: number;
	submit?: (data: any) => void;
}

const query = gql`
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

interface FormField {
	name: string;
	value: any;
}

const fieldsToDefaultValue = (fields?: [FormField]) => {
	if (!fields) {
		return {};
	}
	const output = {} as { [key: string]: any };
	fields.forEach(({ name, value }: FormField) => {
		output[name] = value;
	});
	return output;
};

const FForm: React.FC<any> = ({ formName, step, submit, data }) => {
	console.log({ data });
	const { control, handleSubmit } = useForm({
		defaultValues: fieldsToDefaultValue(data.getForm.fields),
	});

	const onSubmit = submit ? submit : (data: any) => console.log(data);

	return (
		<>
			{process.env.NODE_ENV !== 'production' && (
				<DevTool control={control} />
			)}
			<h1>
				Step {step} - {formName}
			</h1>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Controller
					as={Input}
					name="HelloWorld"
					control={control}
					// defaultValue=""
				/>
				<Controller
					as={Select}
					name="reactSelect"
					control={control}
					onChange={([selected]) => {
						// console.log({ asd: selected.currentTarget.value });
						// React Select return object instead of value for selection
						return selected.currentTarget.value;
					}}
					children={
						<>
							<option value="volvo">Volvo</option>
							<option value="saab">Saab</option>
							<option value="mercedes">Mercedes</option>
							<option value="audi">Audi</option>
						</>
					}
					// defaultValue={''}
				/>

				<input type="submit" />
			</form>
		</>
	);
};

const Form: React.FC<Props> = (props) => {
	const { data, error, loading } = useQuery(query, {
		variables: {
			id: props.formName,
		},
	});

	if (loading) {
		return <h1>Loading</h1>;
	} else {
		return <FForm data={data} {...props} />;
	}
};
export default Form;
