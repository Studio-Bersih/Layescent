interface Users{ 
    ID: number; 
    TOKEN: string; 
    ROLE: "Admin" | "User";
    CABANG: number;
    USAHA: string;
}
export type { Users };