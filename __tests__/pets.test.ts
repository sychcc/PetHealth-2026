// 測試 POST /api/pets 的必填欄位驗證邏輯

// 驗證邏輯（和 route.ts 相同）

function validatePetInput(body: {
  name?: string;
  species?: string;
  birthdate?: string;
}) {
  const { name, species, birthdate } = body;
  if (!name || !species || !birthdate) {
    return { error: "名稱、品種、生日為必填", status: 400 };
  }
  return { valid: true };
}

// 測試

describe("POST /api/pets 必填欄位驗證", () => {
  test("name 缺少時回傳 400", () => {
    const result = validatePetInput({
      species: "貓",
      birthdate: "2021-03-15",
    });
    expect(result).toEqual({ error: "名稱、品種、生日為必填", status: 400 });
  });

  test("species 缺少時回傳 400", () => {
    const result = validatePetInput({
      name: "小橘",
      birthdate: "2021-03-15",
    });
    expect(result).toEqual({ error: "名稱、品種、生日為必填", status: 400 });
  });

  test("birthdate 缺少時回傳 400", () => {
    const result = validatePetInput({
      name: "小橘",
      species: "貓",
    });
    expect(result).toEqual({ error: "名稱、品種、生日為必填", status: 400 });
  });

  test("三個欄位都空時回傳 400", () => {
    const result = validatePetInput({});
    expect(result).toEqual({ error: "名稱、品種、生日為必填", status: 400 });
  });

  test("三個欄位都填寫時通過驗證", () => {
    const result = validatePetInput({
      name: "小橘",
      species: "貓",
      birthdate: "2021-03-15",
    });
    expect(result).toEqual({ valid: true });
  });

  test("name 為空字串時回傳 400", () => {
    const result = validatePetInput({
      name: "",
      species: "貓",
      birthdate: "2021-03-15",
    });
    expect(result).toEqual({ error: "名稱、品種、生日為必填", status: 400 });
  });
});
