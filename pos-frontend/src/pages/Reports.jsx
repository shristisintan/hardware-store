import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";

import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Typography,
} from "@mui/material";

import {
  Inventory2Rounded,
  WarningAmberRounded,
  ErrorOutlineRounded,
  AttachMoneyRounded,
  TrendingUpRounded,
  ShoppingCartRounded,
} from "@mui/icons-material";

import { getProducts } from "../services/productService";

const COLORS = {
  primary: "#2563EB",
  primaryLight: "#EEF2FF",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  background: "#F8FAFC",
  white: "#FFFFFF",
  success: "#16A34A",
  successLight: "#F0FDF4",
  warning: "#D97706",
  warningLight: "#FFFBEB",
  error: "#DC2626",
  errorLight: "#FEF2F2",
};

function Reports() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getProducts();

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // INVENTORY CALCULATIONS
  // ===============================

  const stats = useMemo(() => {
    const totalProducts = products.length;

    const inStock = products.filter(
      (product) => Number(product.stock || 0) > 0
    ).length;

    const outOfStock = products.filter(
      (product) => Number(product.stock || 0) <= 0
    ).length;

    const lowStock = products.filter((product) => {
      const stock = Number(product.stock || 0);
      const threshold = Number(
        product.low_stock_threshold ??
          product.low_stock_limit ??
          10
      );

      return stock > 0 && stock <= threshold;
    }).length;

    const criticalStock = products.filter((product) => {
      const stock = Number(product.stock || 0);
      const threshold = Number(
        product.low_stock_threshold ??
          product.low_stock_limit ??
          5
      );

      return stock <= threshold / 2;
    }).length;

    const inventoryValue = products.reduce(
      (total, product) => {
        return (
          total +
          Number(product.purchase_price || 0) *
            Number(product.stock || 0)
        );
      },
      0
    );

    return {
      totalProducts,
      inStock,
      outOfStock,
      lowStock,
      criticalStock,
      inventoryValue,
    };
  }, [products]);

  // ===============================
  // LOW STOCK PRODUCTS
  // ===============================

  const restockProducts = useMemo(() => {
    return products
      .filter((product) => {
        const stock = Number(product.stock || 0);

        const threshold = Number(
          product.low_stock_threshold ??
            product.low_stock_limit ??
            10
        );

        return stock <= threshold;
      })
      .sort(
        (a, b) =>
          Number(a.stock || 0) -
          Number(b.stock || 0)
      )
      .slice(0, 8);
  }, [products]);

  // ===============================
  // TOP STOCK PRODUCTS
  // ===============================

  const topStockProducts = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          Number(b.stock || 0) -
          Number(a.stock || 0)
      )
      .slice(0, 7);
  }, [products]);

  const maxStock = Math.max(
    ...topStockProducts.map((p) =>
      Number(p.stock || 0)
    ),
    1
  );

  // ===============================
  // CATEGORY STOCK
  // ===============================

  const categoryStock = useMemo(() => {
    const categories = {};

    products.forEach((product) => {
      const category =
        product.category || "Uncategorized";

      categories[category] =
        (categories[category] || 0) +
        Number(product.stock || 0);
    });

    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [products]);

  const maxCategoryStock = Math.max(
    ...categoryStock.map(([, value]) => value),
    1
  );

  // ===============================
  // STATUS
  // ===============================

  const getStockStatus = (product) => {
    const stock = Number(product.stock || 0);

    const threshold = Number(
      product.low_stock_threshold ??
        product.low_stock_limit ??
        10
    );

    if (stock <= 0) {
      return {
        label: "Out of Stock",
        color: COLORS.error,
        background: COLORS.errorLight,
      };
    }

    if (stock <= threshold / 2) {
      return {
        label: "Critical",
        color: COLORS.error,
        background: COLORS.errorLight,
      };
    }

    if (stock <= threshold) {
      return {
        label: "Low",
        color: COLORS.warning,
        background: COLORS.warningLight,
      };
    }

    return {
      label: "Healthy",
      color: COLORS.success,
      background: COLORS.successLight,
    };
  };

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <DashboardLayout
        title="Reports"
        subtitle="Inventory and business overview"
      >
        <Box
          sx={{
            minHeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Reports"
      subtitle="Inventory and business overview"
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        {/* =================================
            PAGE TITLE
        ================================= */}

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            Inventory Overview
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 14,
              color: COLORS.secondary,
            }}
          >
            Monitor stock levels and identify products
            that need attention.
          </Typography>
        </Box>

        {/* =================================
            SUMMARY CARDS
        ================================= */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {/* TOTAL PRODUCTS */}

          <Card
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: COLORS.secondary,
                    }}
                  >
                    Total Products
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 26,
                      fontWeight: 700,
                      color: COLORS.text,
                    }}
                  >
                    {stats.totalProducts}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: COLORS.primaryLight,
                    color: COLORS.primary,
                  }}
                >
                  <Inventory2Rounded />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* IN STOCK */}

          <Card
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: COLORS.secondary,
                    }}
                  >
                    In Stock
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 26,
                      fontWeight: 700,
                      color: COLORS.success,
                    }}
                  >
                    {stats.inStock}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: COLORS.successLight,
                    color: COLORS.success,
                  }}
                >
                  <TrendingUpRounded />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* LOW STOCK */}

          <Card
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: COLORS.secondary,
                    }}
                  >
                    Low Stock
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 26,
                      fontWeight: 700,
                      color: COLORS.warning,
                    }}
                  >
                    {stats.lowStock}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: COLORS.warningLight,
                    color: COLORS.warning,
                  }}
                >
                  <WarningAmberRounded />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* INVENTORY VALUE */}

          <Card
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: COLORS.secondary,
                    }}
                  >
                    Inventory Value
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 22,
                      fontWeight: 700,
                      color: COLORS.text,
                    }}
                  >
                    Rs.{" "}
                    {stats.inventoryValue.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#F0FDF4",
                    color: COLORS.success,
                  }}
                >
                  <AttachMoneyRounded />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* =================================
            STOCK + CATEGORY
        ================================= */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "1.5fr 1fr",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {/* STOCK LEVELS */}

          <Card
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                sx={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: COLORS.text,
                }}
              >
                Stock Levels
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  mb: 3,
                  fontSize: 13,
                  color: COLORS.secondary,
                }}
              >
                Products with the highest available stock
              </Typography>

              {topStockProducts.length === 0 ? (
                <Typography
                  sx={{
                    py: 8,
                    textAlign: "center",
                    color: COLORS.secondary,
                  }}
                >
                  No products available.
                </Typography>
              ) : (
                topStockProducts.map((product) => {
                  const stock = Number(
                    product.stock || 0
                  );

                  const percentage =
                    (stock / maxStock) * 100;

                  return (
                    <Box
                      key={product.id}
                      sx={{ mb: 2 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.7,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: COLORS.text,
                          }}
                        >
                          {product.name}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: COLORS.text,
                          }}
                        >
                          {stock}{" "}
                          {product.unit || "units"}
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 8,
                          borderRadius: 5,
                          backgroundColor:
                            "#E2E8F0",
                          "& .MuiLinearProgress-bar":
                            {
                              borderRadius: 5,
                              backgroundColor:
                                COLORS.primary,
                            },
                        }}
                      />
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* CATEGORY STOCK */}

          <Card
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                sx={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: COLORS.text,
                }}
              >
                Stock by Category
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  mb: 3,
                  fontSize: 13,
                  color: COLORS.secondary,
                }}
              >
                Total available stock by category
              </Typography>

              {categoryStock.length === 0 ? (
                <Typography
                  sx={{
                    py: 8,
                    textAlign: "center",
                    color: COLORS.secondary,
                  }}
                >
                  No category data available.
                </Typography>
              ) : (
                categoryStock.map(
                  ([category, value]) => (
                    <Box
                      key={category}
                      sx={{ mb: 2 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          mb: 0.7,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {category}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={
                          (value /
                            maxCategoryStock) *
                          100
                        }
                        sx={{
                          height: 8,
                          borderRadius: 5,
                          backgroundColor:
                            "#E2E8F0",
                          "& .MuiLinearProgress-bar":
                            {
                              borderRadius: 5,
                              backgroundColor:
                                COLORS.success,
                            },
                        }}
                      />
                    </Box>
                  )
                )
              )}
            </CardContent>
          </Card>
        </Box>

        {/* =================================
            RESTOCK REQUIRED
        ================================= */}

        <Card
          elevation={0}
          sx={{
            border: `1px solid ${COLORS.border}`,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: COLORS.text,
                  }}
                >
                  Restock Required
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 13,
                    color: COLORS.secondary,
                  }}
                >
                  Products that need attention
                </Typography>
              </Box>

              <ShoppingCartRounded
                sx={{
                  color: COLORS.warning,
                }}
              />
            </Box>

            {restockProducts.length === 0 ? (
              <Box
                sx={{
                  py: 5,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: COLORS.success,
                  }}
                >
                  All stock levels look healthy 🎉
                </Typography>
              </Box>
            ) : (
              <Box>
                {restockProducts.map(
                  (product, index) => {
                    const status =
                      getStockStatus(product);

                    const stock = Number(
                      product.stock || 0
                    );

                    const threshold =
                      Number(
                        product.low_stock_threshold ??
                          product.low_stock_limit ??
                          10
                      );

                    return (
                      <Box key={product.id}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
                              {
                                xs: "1fr",
                                sm: "2fr 1fr 1fr 1fr",
                              },
                            gap: 2,
                            alignItems: "center",
                            py: 1.8,
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 700,
                                color:
                                  COLORS.text,
                              }}
                            >
                              {product.name}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.3,
                                fontSize: 11,
                                color:
                                  COLORS.secondary,
                              }}
                            >
                              {product.category ||
                                "Uncategorized"}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              sx={{
                                fontSize: 11,
                                color:
                                  COLORS.secondary,
                              }}
                            >
                              Current Stock
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 700,
                              }}
                            >
                              {stock}{" "}
                              {product.unit ||
                                "units"}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              sx={{
                                fontSize: 11,
                                color:
                                  COLORS.secondary,
                              }}
                            >
                              Minimum
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 700,
                              }}
                            >
                              {threshold}
                            </Typography>
                          </Box>

                          <Box>
                            <Chip
                              label={status.label}
                              size="small"
                              sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                color:
                                  status.color,
                                backgroundColor:
                                  status.background,
                                borderRadius: 1.5,
                              }}
                            />
                          </Box>
                        </Box>

                        {index <
                          restockProducts.length -
                            1 && (
                          <Divider />
                        )}
                      </Box>
                    );
                  }
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* =================================
            STOCK STATUS SUMMARY
        ================================= */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  fontSize: 12,
                  color: COLORS.secondary,
                }}
              >
                Healthy Stock
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  fontSize: 24,
                  fontWeight: 700,
                  color: COLORS.success,
                }}
              >
                {Math.max(
                  stats.inStock -
                    stats.lowStock,
                  0
                )}
              </Typography>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  fontSize: 12,
                  color: COLORS.secondary,
                }}
              >
                Critical Products
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  fontSize: 24,
                  fontWeight: 700,
                  color: COLORS.error,
                }}
              >
                {stats.criticalStock}
              </Typography>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  fontSize: 12,
                  color: COLORS.secondary,
                }}
              >
                Out of Stock
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  fontSize: 24,
                  fontWeight: 700,
                  color: COLORS.error,
                }}
              >
                {stats.outOfStock}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

export default Reports;