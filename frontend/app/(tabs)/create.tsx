import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { API_URL } from '@/constants/api';
import { styles } from '@/assets/styles/create.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/Colors';
import { useAppTheme } from '@/components/ThemeProvider';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


const CATEGORIES = [
    { id: "food", name: "Food & Drinks", icon: "fast-food" },
    { id: "shopping", name: "Shopping", icon: "cart" },
    { id: "transportation", name: "Transportation", icon: "car" },
    { id: "entertainment", name: "Entertainment", icon: "film" },
    { id: "bills", name: "Bills", icon: "receipt" },
    { id: "income", name: "Income", icon: "cash" },
    { id: "other", name: "Other", icon: "ellipsis-horizontal" },
];

const CreateScreen = () => {
    const router = useRouter();
    const { user } = useUser()
    const { theme } = useAppTheme();

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isExpense, setIsExpense] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) return Alert.alert("Error", "Please eneter a transaction title.");
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            Alert.alert("Error", "Please enter a valid amount.");
            return;
        }
        if (!selectedCategory) return Alert.alert("Error", "Please select a category");

        setIsLoading(true)
        try {
            const formattedAmount = isExpense
                ? -Math.abs(parseFloat(amount))
                : Math.abs(parseFloat(amount));
            const response = await fetch(`${API_URL}/transactions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: user.id,
                    title,
                    amount: formattedAmount,
                    category: selectedCategory,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create transaction");
            }
            Alert.alert("success", "Transaction created successfully.");
            router.back();
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to create transaction.");
            console.error("Error creating transaction:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAwareScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* HEADER */}
            <View style={[styles.header, { borderColor: theme.border }]}>
                <TouchableOpacity style={[styles.backButton, { borderColor: theme.border }]} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>New Transaction</Text>
                <TouchableOpacity
                    style={[styles.saveButtonContainer, { borderColor: theme.border }, isLoading && styles.saveButtonDisabled]}
                    onPress={handleCreate}
                    disabled={isLoading}
                >
                    <Text style={[styles.saveButton, { color: theme.text }]}>{isLoading ? "Saving..." : "Save"}</Text>
                    {!isLoading && <Ionicons name="checkmark" size={18} color={theme.primary} />}
                </TouchableOpacity>
            </View>


            <View style={styles.card}>
                <View style={styles.typeSelector}>
                    {/* EXPENSE SELECTOR */}
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            isExpense && {
                                backgroundColor: theme.primary,
                                borderColor: theme.primary,
                            },
                            { borderColor: theme.border }
                        ]}
                        onPress={() => setIsExpense(true)}>
                        <Ionicons name="arrow-down-circle" size={22} color={isExpense ? theme.white : theme.expense} style={styles.typeIcon} />
                        <Text style={[styles.typeButtonText, { color: theme.text }, isExpense && styles.typeButtonTextActive]}>
                            Expense
                        </Text>
                    </TouchableOpacity>

                    {/* INCOME SELECTOR */}
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            !isExpense && {
                                backgroundColor: theme.primary,
                                borderColor: theme.primary,
                            },
                            { borderColor: theme.border }
                        ]}
                        onPress={() => setIsExpense(false)}>
                        <Ionicons name="arrow-up-circle" size={22} color={!isExpense ? theme.white : theme.income} style={styles.typeIcon} />
                        <Text style={[styles.typeButtonText, { color: theme.text }, !isExpense && styles.typeButtonTextActive]}>
                            Income
                        </Text>
                    </TouchableOpacity>

                </View>

                {/* AMOUNT CONTAINER */}
                <View style={[styles.amountContainer, { borderColor: theme.border }]}>
                    <TextInput
                        style={[styles.amountInput, { color: theme.text }]}
                        placeholder='0'
                        placeholderTextColor={theme.text}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType='numeric'
                    />
                    <Text style={[styles.currencySymbol, { color: theme.text }]}>VND</Text>
                </View>


                {/* INPUT CONTAINER */}
                <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                    <Ionicons
                        name="create-outline"
                        size={22}
                        color={theme.textLight}
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={[styles.input, { color: theme.textLight }]}
                        placeholder='Transaction Title'
                        placeholderTextColor={theme.textLight}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>


                {/* TITLE */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    <Ionicons name="pricetag-outline" size={20} />
                    Category
                </Text>

                <View style={[styles.categoryGrid]}>
                    {CATEGORIES.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category.name && {
                                    backgroundColor: theme.primary,
                                    borderColor: theme.primary,
                                },
                                { borderColor: theme.border }
                            ]}
                            onPress={() => setSelectedCategory(category.name)}
                        >
                            <Ionicons
                                name={category.icon}
                                size={20}
                                color={selectedCategory === category.name ? theme.white : theme.text}
                                style={[styles.categoryIcon]}
                            />

                            <Text
                                style={[
                                    styles.categoryButtonText,
                                    { color: theme.text },
                                    selectedCategory === category.name && styles.categoryButtonTextActive,
                                ]}
                            >
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>


            {isLoading && (
                <View style={[styles.loadingContainer, , { borderColor: theme.border }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            )}
        </KeyboardAwareScrollView>
    )
}

export default CreateScreen;