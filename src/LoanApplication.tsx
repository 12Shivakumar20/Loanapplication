import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db,} from './firebaseConfig';
import { collection, addDoc ,serverTimestamp } from 'firebase/firestore';

// Define types
type CattleType = 'Cow' | 'Buffalo' | 'Goat' | 'Sheep' | 'Other' | "";
type LoanPurpose = 'Purchase' | 'Feed' | 'Equipment' | 'Medical' | 'Infrastructure' | 'Other' | "" ;

interface CattleDetails {
  cattleType: CattleType;
  breed: string;
  quantity: string;
  age: string;
  estimatedValue: string;
  insuranceStatus: boolean;
  insuranceDetails: string;
}

interface FormData {
  applicant: {
    name: string;
    fatherName: string;
    aadharNumber: string;
    phone: string;
    village: string;
    district: string;
    state: string;
    pincode: string;
  };
  farm: {
    landSize: string;
    ownershipType: 'Owned'| 'Rented' | "";
    existingCattle: string;
  };
  cattle: CattleDetails[];
  loan: {
    amount: string;
    purpose: LoanPurpose;
    term: string;
  };
  banking: {
    accountNumber: string;
    bankName: string;
    branch: string;
    ifscCode: string;
  };
}

const LoanApplication = () => {
  const [formData, setFormData] = useState<FormData>({
    applicant: {
      name: '',
      fatherName: '',
      aadharNumber: '',
      phone: '',
      village: '',
      district: '',
      state: '',
      pincode: '',
    },
    farm: {
      landSize: '',
      ownershipType: '',
      existingCattle: '',
    },
    cattle: [{
      cattleType: '',    
      breed: '',
      quantity: '',
      age: '',
      estimatedValue: '',
      insuranceStatus: false,
      insuranceDetails: '',
    }],
    loan: {
      amount: '',
      purpose: '',
      term: '12',
    },
    banking: {
      accountNumber: '',
      bankName: '',
      branch: '',
      ifscCode: '',
    }
  });

  const [loading, setLoading] = useState(false);

  const addCattleEntry = () => {
    setFormData(prev => ({
      ...prev,
      cattle: [
        ...prev.cattle,
        {
          cattleType: 'Cow',
          breed: '',
          quantity: '',
          age: '',
          estimatedValue: '',
          insuranceStatus: false,
          insuranceDetails: '',
        },
      ],
    }));
  };

  const removeCattleEntry = (index: number) => {
    if (formData.cattle.length > 1) {
      const updatedCattle = [...formData.cattle];
      updatedCattle.splice(index, 1);
      setFormData(prev => ({ ...prev, cattle: updatedCattle }));
    }
  };

  const resetForm = () => {
    setFormData({
      applicant: {
        name: '',
        fatherName: '',
        aadharNumber: '',
        phone: '',
        village: '',
        district: '',
        state: '',
        pincode: '',
      },
      farm: {
        landSize: '',
        ownershipType: '',
        existingCattle: '',
      },
      cattle: [{
        cattleType: '',
        breed: '',
        quantity: '',
        age: '',
        estimatedValue: '',
        insuranceStatus: false,
        insuranceDetails: '',
      }],
      loan: {
        amount: '',
        purpose:"",
        term: '',
      },
      banking: {
        accountNumber: '',
        bankName: '',
        branch: '',
        ifscCode: '',
      }
    });
  };

  const validateForm = () => {
    // Applicant validation
    if (!formData.applicant.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return false;
    }

    if (!/^\d{12}$/.test(formData.applicant.aadharNumber)) {
      Alert.alert('Validation Error', 'Please enter valid 12-digit Aadhar number');
      return false;
    }

    if (!/^\d{10}$/.test(formData.applicant.phone)) {
      Alert.alert('Validation Error', 'Please enter valid 10-digit phone number');
      return false;
    }

    // Farm validation
    if (!formData.farm.landSize || isNaN(Number(formData.farm.landSize))) {
      Alert.alert('Validation Error', 'Please enter valid land size');
      return false;
    }

    // Cattle validation
    for (const [index, cattle] of formData.cattle.entries()) {
      if (!cattle.breed.trim()) {
        Alert.alert('Validation Error', `Please enter breed for cattle #${index + 1}`);
        return false;
      }
      if (!cattle.quantity || isNaN(Number(cattle.quantity))) {
        Alert.alert('Validation Error', `Please enter valid quantity for cattle #${index + 1}`);
        return false;
      }
      if (cattle.insuranceStatus && !cattle.insuranceDetails.trim()) {
        Alert.alert('Validation Error', `Please enter insurance details for cattle #${index + 1}`);
        return false;
      }
    }

    // Loan validation
    if (!formData.loan.amount || isNaN(Number(formData.loan.amount))) {
      Alert.alert('Validation Error', 'Please enter a valid loan amount');
      return false;
    }

    // Banking validation
    if (!/^\d{9,18}$/.test(formData.banking.accountNumber)) {
      Alert.alert('Validation Error', 'Please enter valid account number');
      return false;
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.banking.ifscCode)) {
      Alert.alert('Validation Error', 'Please enter valid IFSC code');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const docRef = await addDoc(collection(db, 'loanApplications'), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      Alert.alert(
        'Success', 
        'Application submitted successfully!',
        [{ text: 'OK', onPress: () => resetForm() }]
      );
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Error',
        'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Cattle Loan Application</Text>
      </View>

      {/* Applicant Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Applicant Details</Text>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={formData.applicant.name}
            onChangeText={text => setFormData({...formData, applicant: {...formData.applicant, name: text}})}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Father's Name"
            placeholderTextColor="#999"
            value={formData.applicant.fatherName}
            onChangeText={text => setFormData({...formData, applicant: {...formData.applicant, fatherName: text}})}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Aadhar Number"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={12}
            value={formData.applicant.aadharNumber}
            onChangeText={text => setFormData({...formData, applicant: {...formData.applicant, aadharNumber: text}})}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={10}
            value={formData.applicant.phone}
            onChangeText={text => setFormData({...formData, applicant: {...formData.applicant, phone: text}})}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Village/Town"
            placeholderTextColor="#999"
            value={formData.applicant.village}
            onChangeText={text => setFormData({...formData, applicant: {...formData.applicant, village: text}})}
          />
        </View>
        
        <View style={styles.row}>
          <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
            <TextInput
              style={styles.input}
              placeholder="District"
              placeholderTextColor="#999"
              value={formData.applicant.district}
              onChangeText={text => setFormData({...formData, applicant: {...formData.applicant, district: text}})}
            />
          </View>
          <View style={[styles.inputGroup, {flex: 1}]}>
            <TextInput
              style={styles.input}
              placeholder="State"
              placeholderTextColor="#999"
              value={formData.applicant.state}
              onChangeText={text => setFormData({...formData, applicant: {...formData.applicant, state: text}})}
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Pincode"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={6}
            value={formData.applicant.pincode}
            onChangeText={text => setFormData({...formData, applicant: {...formData.applicant, pincode: text}})}
          />
        </View>
      </View>

      {/* Farm Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Farm Details</Text>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Land Size (acres)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.farm.landSize}
            onChangeText={text => setFormData({...formData, farm: {...formData.farm, landSize: text}})}
          />
        </View>
        
        <View style={[styles.inputGroup, styles.pickerWrapper]}>
          <Picker
            selectedValue={formData.farm.ownershipType}
            style={styles.picker}
            dropdownIconColor="#333"
            mode="dropdown"
            itemStyle={styles.pickerItem}
            onValueChange={itemValue => setFormData({...formData, farm: {...formData.farm, ownershipType: itemValue}})}>
            <Picker.Item label="Select Ownership Type" value="" enabled={false} />
            <Picker.Item label="Owned" value="Owned" />
            <Picker.Item label="Rented" value="Rented" />
          </Picker>
        </View>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Existing Cattle Count"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.farm.existingCattle}
            onChangeText={text => setFormData({...formData, farm: {...formData.farm, existingCattle: text}})}
          />
        </View>
      </View>

      {/* Cattle Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cattle Details</Text>
        {formData.cattle.map((cattle, index) => (
          <View key={index} style={[styles.cattleEntry, {marginBottom: 20}]}>
            <Text style={styles.subSectionTitle}>Cattle #{index + 1}</Text>
            
            <View style={[styles.inputGroup, styles.pickerWrapper]}>
              <Picker
                selectedValue={cattle.cattleType}
                style={styles.picker}
                dropdownIconColor="#333"
                mode="dropdown"
                itemStyle={styles.pickerItem}
                onValueChange={itemValue => {
                  const updatedCattle = [...formData.cattle];
                  updatedCattle[index].cattleType = itemValue;
                  setFormData({...formData, cattle: updatedCattle});
                }}>
                <Picker.Item label="Select" value="" enabled={false} />
                <Picker.Item label="Cow" value="Cow" />
                <Picker.Item label="Buffalo" value="Buffalo" />
                <Picker.Item label="Goat" value="Goat" />
                <Picker.Item label="Sheep" value="Sheep" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
            
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Breed"
                placeholderTextColor="#999"
                value={cattle.breed}
                onChangeText={text => {
                  const updatedCattle = [...formData.cattle];
                  updatedCattle[index].breed = text;
                  setFormData({...formData, cattle: updatedCattle});
                }}
              />
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                <TextInput
                  style={styles.input}
                  placeholder="Quantity"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={cattle.quantity}
                  onChangeText={text => {
                    const updatedCattle = [...formData.cattle];
                    updatedCattle[index].quantity = text;
                    setFormData({...formData, cattle: updatedCattle});
                  }}
                />
              </View>
              <View style={[styles.inputGroup, {flex: 1}]}>
                <TextInput
                  style={styles.input}
                  placeholder="Age (years)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={cattle.age}
                  onChangeText={text => {
                    const updatedCattle = [...formData.cattle];
                    updatedCattle[index].age = text;
                    setFormData({...formData, cattle: updatedCattle});
                  }}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Estimated Value (₹)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={cattle.estimatedValue}
                onChangeText={text => {
                  const updatedCattle = [...formData.cattle];
                  updatedCattle[index].estimatedValue = text;
                  setFormData({...formData, cattle: updatedCattle});
                }}
              />
            </View>
            
            <View style={[styles.inputGroup, styles.insuranceContainer]}>
              <Text style={styles.insuranceLabel}>Insured:</Text>
              <View style={styles.insuranceToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.insuranceToggleOption, 
                    !cattle.insuranceStatus && styles.insuranceToggleActive
                  ]}
                  onPress={() => {
                    const updatedCattle = [...formData.cattle];
                    updatedCattle[index].insuranceStatus = false;
                    setFormData({...formData, cattle: updatedCattle});
                  }}>
                  <Text style={[
                    styles.insuranceToggleText,
                    !cattle.insuranceStatus && styles.insuranceToggleTextActive
                  ]}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.insuranceToggleOption, 
                    cattle.insuranceStatus && styles.insuranceToggleActive
                  ]}
                  onPress={() => {
                    const updatedCattle = [...formData.cattle];
                    updatedCattle[index].insuranceStatus = true;
                    setFormData({...formData, cattle: updatedCattle});
                  }}>
                  <Text style={[
                    styles.insuranceToggleText,
                    cattle.insuranceStatus && styles.insuranceToggleTextActive
                  ]}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {cattle.insuranceStatus && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Insurance Details"
                  placeholderTextColor="#999"
                  value={cattle.insuranceDetails}
                  onChangeText={text => {
                    const updatedCattle = [...formData.cattle];
                    updatedCattle[index].insuranceDetails = text;
                    setFormData({...formData, cattle: updatedCattle});
                  }}
                />
              </View>
            )}
            
            {formData.cattle.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeCattleEntry(index)}>
                <Text style={styles.removeButtonText}>Remove This Cattle</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        <TouchableOpacity style={styles.addButton} onPress={addCattleEntry}>
          <Text style={styles.addButtonText}>+ Add More Cattle</Text>
        </TouchableOpacity>
      </View>

      {/* Loan Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Loan Details</Text>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Loan Amount (₹)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.loan.amount}
            onChangeText={text => setFormData({...formData, loan: {...formData.loan, amount: text}})}
          />
        </View>
        
        <View style={[styles.inputGroup, styles.pickerWrapper]}>
          <Picker
            selectedValue={formData.loan.purpose}
            style={styles.picker}
            dropdownIconColor="#333"
            mode="dropdown"
            itemStyle={styles.pickerItem}
            onValueChange={itemValue => setFormData({...formData, loan: {...formData.loan, purpose: itemValue}})}>
            <Picker.Item label="Select Loan Purpose" value="" enabled={false} />
            <Picker.Item label="Purchase Cattle" value="Purchase" />
            <Picker.Item label="Cattle Feed" value="Feed" />
            <Picker.Item label="Equipment" value="Equipment" />
            <Picker.Item label="Medical" value="Medical" />
            <Picker.Item label="Infrastructure" value="Infrastructure" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Loan Term (months)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.loan.term}
            onChangeText={text => setFormData({...formData, loan: {...formData.loan, term: text}})}
          />
        </View>
      </View>

      {/* Banking Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Banking Information</Text>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Account Number"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.banking.accountNumber}
            onChangeText={text => setFormData({...formData, banking: {...formData.banking, accountNumber: text}})}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Bank Name"
            placeholderTextColor="#999"
            value={formData.banking.bankName}
            onChangeText={text => setFormData({...formData, banking: {...formData.banking, bankName: text}})}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Branch"
            placeholderTextColor="#999"
            value={formData.banking.branch}
            onChangeText={text => setFormData({...formData, banking: {...formData.banking, branch: text}})}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="IFSC Code"
            placeholderTextColor="#999"
            value={formData.banking.ifscCode}
            onChangeText={text => setFormData({...formData, banking: {...formData.banking, ifscCode: text.toUpperCase()}})}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  headerContainer: {
    backgroundColor: '#2980b9',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    color: '#3498db',
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 16,
  },
  pickerWrapper: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 60,
    width: '100%',
    color: '#333',
    backgroundColor: '#fff',
  },
  pickerItem: {
    fontSize: 16,
    height: 150,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cattleEntry: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  insuranceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  insuranceLabel: {
    fontSize: 16,
    color: '#555',
  },
  insuranceToggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  insuranceToggleOption: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  insuranceToggleActive: {
    backgroundColor: '#2980b9',
  },
  insuranceToggleText: {
    fontSize: 16,
    color: '#555',
  },
  insuranceToggleTextActive: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#2980b9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default LoanApplication;