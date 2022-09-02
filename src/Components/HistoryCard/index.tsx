import React from "react";
import { TouchableOpacityProps } from 'react-native';

import { 
    Container,
    Title,
    Amount,
} from './styles';

type Props = TouchableOpacityProps & {
    color: string;
    title: string;
    amount: string;
}

export function HistoryCard({color, title, amount, ...rest}: Props) {
    return (
        <Container color={color} {...rest}>
            <Title>{title}</Title>
            <Amount>{amount}</Amount>
        </Container>
    )
}