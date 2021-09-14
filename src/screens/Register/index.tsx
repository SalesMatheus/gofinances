import React, { useState } from 'react';
import { Modal } from 'react-native';

import { CategorySelect } from '../CategorySelect';
import { Input } from '../../Components/Forms/Input'
import { Button } from '../../Components/Forms/Button';
import { CategorySelectButton } from '../../Components/Forms/CategorySelectButton';
import { TransactionTypeButton } from '../../Components/Forms/TransactionTypeButton';


import { 
  Container,
  Header,
  Title,
  Form,
  Fields,
  TransactionTypes
} from './styles';

export function Register() {
    const [transactionType, setTransactionType] = useState('');
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const [category, setCategory] = useState({
        key: 'category',
        name: 'categoria'
    });

    function handleTransactionTypeSelect(type: 'up' | 'down'){
        setTransactionType(type);
    }

    function handleOpenModalCategory(){
        setCategoryModalOpen(true);
    }

    function handleCloseModalCategory(){
        setCategoryModalOpen(false);
    }

    return (
        <Container>
            <Header>
                <Title>Cadastro</Title>
            </Header>

            <Form>
                <Fields>
                    <Input 
                        placeholder="Nome"
                    />
                    <Input 
                        placeholder="Preço"
                    />

                    <TransactionTypes>
                        <TransactionTypeButton 
                            type="up"
                            title="Income"
                            onPress={() => handleTransactionTypeSelect('up')}
                            isActive={transactionType === 'up'}
                        />
                        <TransactionTypeButton 
                            type="down"
                            title="Outcome"
                            onPress={() => handleTransactionTypeSelect('down')}
                            isActive={transactionType === 'down'}
                        />
                    </TransactionTypes>
                    
                    <CategorySelectButton 
                        title={category.name}
                        onPress={handleOpenModalCategory}
                    />
                </Fields>

                <Button 
                    title="Enviar"
                />
            </Form>

            <Modal visible={categoryModalOpen}>
                <CategorySelect 
                    category={category}
                    setCategory={setCategory}
                    closeSelectCategory={handleCloseModalCategory}
                />
            </Modal>
        </Container>
    )
}