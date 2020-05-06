import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input, Select } from './htmlTag';
import { DevTool } from 'react-hook-form-devtools';

interface Props {
	formName: string;
	step: number;
	submit?: (data: any) => void;
}

const Form: React.FC<Props> = ({ formName, step, submit }) => {
	const { control, handleSubmit } = useForm({
		defaultValues: {
			HelloWorld: 'plz',
			reactSelect: 'audi',
		},
	});
	const onSubmit = submit ? submit : (data: any) => console.log(data);

	return (
		<>
			{process.env.NODE_ENV !== 'production' && (
				<DevTool control={control} />
			)}
			<h1>Step {step}</h1>
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
export default Form;
