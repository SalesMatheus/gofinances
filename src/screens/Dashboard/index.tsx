import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator } from 'react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';

import { HighlightCard } from '../../Components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../Components/TransactionCard';


import { 
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  LogoutButton,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LoadContainer,
} from './styles';

export interface DataListProps extends TransactionCardProps{
  id: string;
}

interface HighlightDataProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightDataProps;
  expensives: HighlightDataProps;
  total: HighlightDataProps
}

export function Dashboard() {
  const [ isLoading, setIsloading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

  const theme = useTheme();
  const { signOut, user } = useAuth();

  function getLastTransactionDate(colletion: DataListProps[], type: 'up' | 'down'){

    const lastTransaction = new Date(Math.max.apply(Math, colletion
      .filter(transaction => transaction.type === type)
      .map(transaction => new Date(transaction.date).getTime())));
  
      return  `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR', {month: 'long'})}`
  }

  async function loadTransactions(){
    const dataKey = '@gofinances:transactions';
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];
    
    let entriesTotal  = 0;
    let expensiveTotal   = 0;

    const transactionsFormatted: DataListProps[] = transactions
    .map((item: DataListProps) => {

      if(item.type === 'up') {
        entriesTotal += Number(item.amount)
      } else {
        expensiveTotal += Number(item.amount)
      }

      const amount = Number(item.amount)
      .toLocaleString('pt-BR', {
        style: 'currency', 
        currency: 'BRL'
      })

      const date = Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }).format(new Date(item.date));

      return {
        id: item.id,
        name: item.name,
        amount,
        type: item.type,
        category: item.category,
        date
      }
    });

    setTransactions(transactionsFormatted);
    
    const lastTransactionsEntries = getLastTransactionDate(transactions, 'up');
    const lastTransactionsExpensive = getLastTransactionDate(transactions, 'down');
    const totalInterval = `01 a ${lastTransactionsExpensive}`;


    const total = entriesTotal - expensiveTotal;
    
    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency', 
          currency: 'BRL'
        }),
        lastTransaction: `Última entrada dia ${lastTransactionsEntries}`
      },
      expensives: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency', 
          currency: 'BRL'
        }),
        lastTransaction: `Última saída dia ${lastTransactionsExpensive}`
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency', 
          currency: 'BRL'
        }),
        lastTransaction: totalInterval
      }
    });
    setIsloading(false);
  }
  useEffect(() => {
    loadTransactions()
  },[]);

  useFocusEffect(useCallback(() => {
    loadTransactions();
  },[]));
  
  return (
    <Container>
      {
        isLoading 
        ? 
          <LoadContainer>
            <ActivityIndicator 
              color={theme.colors.primary}
              size="large"
            /> 
          </LoadContainer>
        :
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo 
                  source={{ uri: user.photo}}
                />
                <User>
                  <UserGreeting>Olá, </UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>

              <LogoutButton  onPress={signOut}>
                <Icon name="power"/>
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>

            <HighlightCard 
              type="up"
              title="Entradas"
              amount={highlightData.entries.amount}
              lasTransaction={highlightData.entries.lastTransaction}
            />
            <HighlightCard 
              type="down"
              title="Saídas"
              amount={highlightData.expensives.amount}
              lasTransaction={highlightData.expensives.lastTransaction}
            />
            <HighlightCard 
              type="total"
              title="Total"
              amount={highlightData.total.amount}
              lasTransaction={highlightData.total.lastTransaction}
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>

            <TransactionList 
              data={transactions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />

            
          </Transactions>
        </>
      }
    </Container>
  );
}