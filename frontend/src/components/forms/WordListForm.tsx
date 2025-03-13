import React from 'react';
import { Form } from 'react-bootstrap';

interface WordListFormProps {
  name: string;
  description: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

const WordListForm: React.FC<WordListFormProps> = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  disabled = false
}) => {
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>List Name</Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={onNameChange}
          disabled={disabled}
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Description (Optional)</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={description}
          onChange={onDescriptionChange}
          disabled={disabled}
        />
      </Form.Group>
    </>
  );
};

export default WordListForm;