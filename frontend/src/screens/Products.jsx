import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import SearchFilterBar from "../components/SearchFilterBar";

const Products = () => {
	const [products, setProducts] = useState([]);
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [sortConfig, setSortConfig] = useState({ price: null, name: null }); // null, "asc", or "desc"
	const [searchParams] = useSearchParams();
	const productCategory = searchParams.get("category");

	// Apply sorting to products based on sortConfig
	const applySorting = useCallback(
		(items) => {
			return [...items].sort((a, b) => {
				// First sort by price if specified
				if (sortConfig.price) {
					const priceCompare = sortConfig.price === "asc" ? a.price - b.price : b.price - a.price;
					if (priceCompare !== 0) return priceCompare;
				}

				// Then sort by name if specified
				if (sortConfig.name) {
					const nameA = a.name.toLowerCase();
					const nameB = b.name.toLowerCase();
					if (sortConfig.name === "asc") {
						return nameA.localeCompare(nameB);
					}
					return nameB.localeCompare(nameA);
				}
				return 0;
			});
		},
		[sortConfig]
	);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				let { data } = await axios.get("http://localhost:5001/api/products");
				if (productCategory) {
					data = data.filter((item) => item.category == productCategory);
				}
				setProducts(data);
				setFilteredProducts(applySorting(data));
			} catch (error) {
				console.error("Error fetching products:", error);
			}
		};

		fetchProducts();
	}, [applySorting, productCategory, searchParams, sortConfig]);

	// Search Function
	const handleSearch = (searchTerm) => {
		const filtered = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
		setFilteredProducts(applySorting(filtered));
	};

	// Sort Function
	const handleSort = (field, order) => {
		setSortConfig((prev) => ({ ...prev, [field]: order }));
	};

	// Group by Brand Function
	const handleGroupByBrand = (isGrouped) => {
		if (isGrouped) {
			// Group products by brand
			const groupedProducts = products.reduce((acc, product) => {
				if (!acc[product.brand]) acc[product.brand] = [];
				acc[product.brand].push(product);
				return acc;
			}, {});

			// Flatten grouped results and apply sorting
			const sortedByBrand = applySorting(Object.values(groupedProducts).flat());
			setFilteredProducts(sortedByBrand);
		} else {
			setFilteredProducts(applySorting(products));
		}
	};

	return (
		<>
			<div className="h-100 flex bg-gray-100 border shadow-md justify-between">
				<h1 className="text-3xl font-bold md:mb-5 md:mt-5 md:ps-7 justify-start md:w-1/3 hidden md:flex whitespace-nowrap">
					{productCategory || "All Products"}
				</h1>
				<SearchFilterBar
					onSearch={handleSearch}
					onSort={handleSort}
					onGroupByBrand={handleGroupByBrand}
					sortConfig={sortConfig}
				/>
			</div>

			<div className="container mx-auto p-5">
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{filteredProducts.map((product) => (
						<div key={product._id} className="p-4 border rounded-lg shadow-md">
							<Link to={`/product/${product._id}`} className="block">
								<img
									src={`http://localhost:5001${product.image}`}
									alt={product.name}
									className="w-full h-48 object-cover rounded"
								/>
								<h2 className="text-lg font-semibold mt-2">{product.name}</h2>
							</Link>
							<p className="text-blue-500 text-xs font-medium">{product.category}</p>
							<p className="text-green-600 font-bold">£{product.price}</p>
						</div>
					))}
				</div>
			</div>
		</>
	);
};

export default Products;
