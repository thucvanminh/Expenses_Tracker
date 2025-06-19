import Toast from 'react-native-toast-message';

// Khi thành công
Toast.show({
    type: 'success',
    text1: 'Thành công!',
    text2: 'Bạn đã cập nhật thông tin thành công.',
});

// Khi lỗi
Toast.show({
    type: 'error',
    text1: 'Lỗi',
    text2: 'Có lỗi xảy ra, vui lòng thử lại.',
});