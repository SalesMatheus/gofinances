import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from 'react-native'; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VictoryAxis, VictoryChart, VictoryLabel, VictoryLegend, VictoryLine, VictoryPie, VictoryScatter, VictoryTheme } from 'victory-native';
import { RFValue } from "react-native-responsive-fontsize";
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFocusEffect } from "@react-navigation/native";

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useTheme } from "styled-components";
import { useAuth } from "../../hooks/auth";

import { HistoryCard } from "../../Components/HistoryCard";
import { categories } from "../../utils/categories";

import { 
    Container,
    Header,
    Title,
    Content,
    ChartContainer,
    MonthSelect,
    MonthSelectButton,
    MonthSelectIcon,
    Month,
    LoadContainer
  } from './styles';



interface TransactionData {
    type: 'up' | 'down';
    name: string;
    amount: string;
    category: string;
    date: string;
}

interface CategoryData {
    key: string;
    name: string;
    total: number;
    totalFormatted: string;
    color: string;
    percent: string;
}

export function Resume() {
    const [selected, setSelected] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date);
    const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);

    const theme = useTheme();
    const { user } = useAuth();

    function handleCardOnPress(id: string) {
        setSelected(prev => prev === id ? "" : id);
    
    }

    function handleDateChange(action: 'next' | 'prev') {

        if(action === 'next'){
            setSelectedDate(addMonths(selectedDate, 1));

        }else{
            setSelectedDate(subMonths(selectedDate, 1));
        }
    }

    async function loadData() {
        
        setIsLoading(true);

        const dataKey = `@gofinances:transactions_user:${user.id}`;

        const response = await AsyncStorage.getItem(dataKey);
        const responseFormatted = response ? JSON.parse(response): [];

        const expensives = responseFormatted
        .filter((expensive: TransactionData) => 
            expensive.type === 'down' &&
            new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
            new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
        );

        const expensivesTotal = expensives
        .reduce((acumullator: number, expensive: TransactionData) => {
            return acumullator + Number(expensive.amount);
        }, 0);

        const totalByCategory: CategoryData[] = [];

        categories.forEach(category => {
            let categorySum = 0;

            expensives.forEach((expensive: TransactionData) => {
                if(expensive.category === category.key){
                    categorySum += Number(expensive.amount);
                }
            });

            if(categorySum > 0 ){
                const totalFormatted = categorySum
                .toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })

                const percent = `${(categorySum / expensivesTotal * 100).toFixed(0)}%`

                totalByCategory.push({
                    key: category.key,
                    name: category.name,
                    color: category.color,
                    total: categorySum,
                    totalFormatted,
                    percent,
                })
            }
        })

        setTotalByCategories(totalByCategory);
        setIsLoading(false);
    }

    useFocusEffect(useCallback(() => {
        loadData();
    },[selectedDate]));
        
    return (
        <Container>
            <Header>
                <Title>
                    Resumo por categoria
                </Title>
            </Header>
            
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
                <Content
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingBottom: useBottomTabBarHeight(),
                    }}
                >

                    <MonthSelect>
                        <MonthSelectButton onPress={() => handleDateChange('prev')}>
                            <MonthSelectIcon name="chevron-left"/>
                        </MonthSelectButton>

                        <Month>
                            {format(selectedDate, 'MMMM, yyyy', {locale: ptBR})}
                        </Month>

                        <MonthSelectButton onPress={() => handleDateChange('next')}> 
                            <MonthSelectIcon name="chevron-right"/>
                        </MonthSelectButton>
                    </MonthSelect>

                    <ChartContainer>
                        <VictoryPie
                            cornerRadius={8}
                            padAngle={3}
                            innerRadius={80}
                            data={totalByCategories}
                            colorScale={totalByCategories.map(category => category.color)}
                            animate={{ 
                                duration: 1000,
                            }}
                            style={{
                                labels: { 
                                    fontSize: RFValue(18),
                                    fontWeight: 'bold',
                                    fill: theme.colors.shape,
                                    display: ({ datum }) => (datum.key === selected || selected === "") ? "block" : "none",
                                },
                                data: {
                                    fill: ({ datum }) => (datum.key === selected || selected === "") ? datum.color : theme.colors.text,
                                }
                            }}
                            labelRadius={100}
                            x="percent"
                            y="total"
                        />
                        {/* <VictoryLegend 
                            data={totalByCategories} 
                            colorScale={totalByCategories.map(category => category.color)}
                        /> */}
                    </ChartContainer>
                    
                    {
                        totalByCategories.map(item => (
                            <HistoryCard
                                onPress={() => handleCardOnPress(item.key)}
                                key={item.key}
                                title={item.key}
                                amount={item.totalFormatted}
                                color={item.color}
                            />
                        ))
                    }
                    <VictoryChart theme={VictoryTheme.material} >
                        <VictoryAxis/>
                        <VictoryScatter 
                            size={5} 
                            data={totalByCategories} 
                            x="key"
                            y="total"
                            style={{ 
                            data: { fill: "#113259" } 
                            }}
                        />
                        <VictoryLine 
                            data={totalByCategories} 
                            x="key" 
                            y="total" 
                            animate 
                            interpolation="natural" 
                            labels={totalByCategories.map(expense => expense.total)}
                            style={{
                            data: {
                                stroke: "#113259",
                                strokeWidth: 3,
                            }
                            }}
                            labelComponent={
                            <VictoryLabel 
                                textAnchor="end" 
                                verticalAnchor="start" 
                                dy={20} 
                                style={[
                                { fill: "#6D7278", fontSize: 16 }
                                ]}
                            />
                            }
                        />
                    </VictoryChart>
                </Content>
            }
        </Container>
    )
}