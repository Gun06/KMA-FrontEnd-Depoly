export type OfficeKey = 'daejeon' | 'yeongnam' | 'seoul';

export interface OfficeInfo {
  key: OfficeKey;
  tabLabel: string;
  title: string;
  role: string;
  address: string;
  tel: string;
  fax: string;
  homepage: string;
  mapTitle: string;
  mapSrc: string;
}

export const OFFICES: OfficeInfo[] = [
  {
    key: 'daejeon',
    tabLabel: '대전 본사',
    title: '전마협 대전본사',
    role: '중앙 본부',
    address: '대전시 대덕구 비래동 103-1 대동빌딩 2층',
    tel: '042) 638-1080',
    fax: '042) 638-1087',
    homepage: 'WWW.RUN1080.COM',
    mapTitle: '전마협 대전본사 위치',
    mapSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3213.2268925097114!2d127.44053799014415!3d36.35528272144064!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3565485d389c9c51%3A0x51ff196e072e749b!2z64yA7KCE6rSR7Jet7IucIOuMgOuNleq1rCDruYTrnpjrj5kgMTAzLTEgMuy4tQ!5e0!3m2!1sko!2skr!4v1755626619658!5m2!1sko!2skr',
  },
  {
    key: 'yeongnam',
    tabLabel: '영남 지사',
    title: '전마협 영남지사',
    role: '영남권 지역본부',
    address: '경북 상주시 삼백로 60-9번지(향군회관 3층)',
    tel: '054) 535-1080',
    fax: '054) 531-1082',
    homepage: 'WWW.RUN1080.COM',
    mapTitle: '전마협 영남지사 위치',
    mapSrc: `https://www.google.com/maps?q=${encodeURIComponent('경북 상주시 삼백로 60-9 향군회관')}&output=embed`,
  },
  {
    key: 'seoul',
    tabLabel: '서울 지사',
    title: '전마협 서울지사',
    role: '수도권 지역본부',
    address: '서울 송파구 방이동 백제고분로 501 청호빌딩 302호',
    tel: '02) 417-1080',
    fax: '02) 417-1082',
    homepage: 'WWW.RUN1080.COM',
    mapTitle: '전마협 서울지사 위치',
    mapSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3164.71747898088!2d127.07078482647353!3d37.51458103131422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca450879adccd%3A0x7701bd84f28c7f68!2z7J6g7Iuk7Jis66a87ZS97KO86rK96riw7J6l!5e0!3m2!1sko!2skr!4v1755626779717!5m2!1sko!2skr',
  },
];
