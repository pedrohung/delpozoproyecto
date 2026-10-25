# Roadmap — La Estrella Cubana

## Hecho
- [x] Sistema de diseño de marca (paleta, fuentes, utilidades) en src/styles.css
- [x] Config de marca + store local (src/config/brand.ts, src/lib/store.ts)
- [x] Logo estrella vectorial, PhotoSlot, ModuleError, StaffShell
- [x] Web pública (/), Carta QR (/carta), Tienda (/tienda), Acceso (/acceso)

## En curso (circuito operativo, pedido del usuario)
- [ ] /salon — plano mesas/banquetas, comanda, cuenta, cobrar
- [ ] /cocina y /bar — estaciones con estados, aviso sonoro, imprimir comanda
- [ ] /mostrador — venta de tienda con shopSale
- [ ] /admin — personalización, carta, trabajadores, ventas/arqueo, horas, salón, QR
- [ ] Verificar circuito completo: QR → pedido → estación → listo → servido → cobrar → arqueo
- [ ] Tests de reglas (roles/acceso, precio congelado en ventas)
