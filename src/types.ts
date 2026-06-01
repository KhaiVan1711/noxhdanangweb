export interface Project {
  id: string;
  name: string;
  location: string;
  investor: string;
  status: string;
  price: string;
  priceRaw: number;
  progress: number;
  image: string;
  tag: "receiving" | "coming_soon" | "completed";
  coordinates: { x: number; y: number };
  lat?: number;
  lng?: number;
  districts: string;
  scale: string;
  types: string;
  deadline: string;
  hotline: string;
  requirements: string[];
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface EligibilityCriteria {
  targetGroup: string; // 'state_worker' | 'low_income' | 'industrial_worker' | 'other'
  housingStatus: string; // 'no_house' | 'insufficient_space' | 'has_house'
  residenceStatus: string; // 'permanent_resident' | 'temporary_resident_over_1yr' | 'temporary_resident_under_1yr'
  incomeStatus: string; // 'none_taxpayer' | 'taxpayer'
}

export interface TrackingProfile {
  id: string;
  fullName: string;
  projectName: string;
  status: "submitting" | "reviewing" | "approved" | "rejected" | "signed_contract";
  progressPercent: number;
  updateDate: string;
  note: string;
}

export const WARDS = [
  "Xã Gò Nổi",
  "Phường Điện Bàn",
  "Xã Thạnh Bình",
  "Xã Nam Trà My",
  "Xã Trà Tập",
  "Xã Đông Giang",
  "Xã Duy Nghĩa",
  "Xã Quế Phước",
  "Xã Tam Xuân",
  "Xã Thăng Phú",
  "Xã Trà Linh",
  "Xã Phú Thuận",
  "Xã Bến Giằng",
  "Xã Đức Phú",
  "Xã La Dêê",
  "Xã La Êê",
  "Xã Tân Hiệp",
  "Xã Trà Đốc",
  "Xã Trà Leng",
  "Đặc khu Hoàng Sa",
  "Phường An Hải",
  "Phường An Khê",
  "Phường Cẩm Lệ",
  "Phường Hải Châu",
  "Phường Hải Vân",
  "Phường Hòa Cường",
  "Phường Hòa Khánh",
  "Phường Hòa Xuân",
  "Phường Liên Chiểu",
  "Phường Ngũ Hành Sơn",
  "Phường Sơn Trà",
  "Phường Thanh Khê",
  "Xã Avương",
  "Xã Bà Nà",
  "Xã Bến Hiên",
  "Xã Đắc Pring",
  "Xã Hòa Tiến",
  "Xã Hòa Vang",
  "Xã Hùng Sơn",
  "Xã Nam Giang",
  "Xã Sông Kôn",
  "Xã Sông Vàng",
  "Xã Tam Hải",
  "Xã Thăng Trường",
  "Xã Trà Giáp",
  "Xã Trà Vân",
  "Phường Hội An Tây",
  "Xã Quế Sơn Trung",
  "Xã Sơn Cẩm Hà",
  "Xã Tây Giang",
  "Xã Nông Sơn",
  "Xã Xuân Phú",
  "Phường Hội An",
  "Xã Thạnh Mỹ",
  "Xã Hà Nha",
  "Xã Quế Sơn",
  "Xã Thăng Điền",
  "Xã Vu Gia",
  "Xã Thu Bồn",
  "Xã Trà Tân",
  "Phường Hương Trà",
  "Phường Điện Bàn Bắc",
  "Xã Đồng Dương",
  "Xã Thăng An",
  "Xã Lãnh Ngọc",
  "Xã Tam Anh",
  "Xã Nam Phước",
  "Xã Khâm Đức",
  "Xã Trà Liên",
  "Xã Tam Mỹ",
  "Xã Hiệp Đức",
  "Xã Duy Xuyên",
  "Phường Hội An Đông",
  "Xã Thượng Đức",
  "Xã Phước Thành",
  "Xã Núi Thành",
  "Xã Trà My",
  "Xã Đại Lộc",
  "Xã Tiên Phước",
  "Phường Tam Kỳ",
  "Xã Phước Hiệp",
  "Phường Bàn Thạch",
  "Xã Phước Chánh",
  "Xã Việt An",
  "Xã Phước Năng",
  "Phường Quảng Phú",
  "Xã Điện Bàn Tây",
  "Xã Phú Ninh",
  "Xã Thăng Bình",
  "Xã Phước Trà",
  "Xã Tây Hồ",
  "Phường Điện Bàn Đông",
  "Phường An Thắng",
  "Xã Chiên Đàn"
];
