import "./App.css";

import { Button } from "@/common/components/ui/button";
import { ThemeProvider } from "@ui/ThemeProvider.tsx";
import { Textarea } from "@ui/textarea.tsx";
import {
	DefaultKeyboardShortcutsDialog,
	DefaultKeyboardShortcutsDialogContent,
	DefaultZoomMenu,
	DefaultZoomMenuContent,
	type TLComponents,
	type TLUiOverrides,
	Tldraw,
	TldrawUiMenuGroup,
	TldrawUiMenuItem,
	toolbarItem,
	useTools,
} from "tldraw";
import { BaseBoxShapeTool } from "tldraw";
import {
	HTMLContainer,
	Rectangle2d,
	type ShapeProps,
	ShapeUtil,
	T,
	type TLBaseShape,
	type TLOnEditEndHandler,
	type TLOnResizeHandler,
	resizeBox,
	structuredClone,
	useIsEditing,
} from "tldraw";
import "tldraw/tldraw.css";

export class MyshapeTool extends BaseBoxShapeTool {
	static override id = "Myshape";
	static override initial = "idle";
	override shapeType = "Myshape";
}

export const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
		// Create a tool item in the ui's context.
		tools.Myshape = {
			id: "Myshape",
			icon: "color",
			label: "Myshape",
			kbd: "c",
			onSelect: () => {
				editor.setCurrentTool("Myshape");
			},
		};
		return tools;
	},
	toolbar(_app, toolbar, { tools }) {
		// Add the tool item from the context to the toolbar.
		toolbar.splice(4, 0, toolbarItem(tools.Myshape));
		return toolbar;
	},
};

export const components: TLComponents = {
	KeyboardShortcutsDialog: (props) => {
		const tools = useTools();
		return (
			<DefaultKeyboardShortcutsDialog {...props}>
				<DefaultKeyboardShortcutsDialogContent />
				{/* Ideally, we'd interleave this into the tools group */}
				<TldrawUiMenuItem {...tools["Myshape"]} />
			</DefaultKeyboardShortcutsDialog>
		);
	},
	ZoomMenu: CustomZoomMenu,
};

// There's a guide at the bottom of this file!

// [1]
type IMyshape = TLBaseShape<
	"Myshape",
	{
		w: number;
		h: number;
	}
>;

export class MyshapeUtil extends ShapeUtil<IMyshape> {
	// [2]
	static override type = "Myshape" as const;
	static override props: ShapeProps<IMyshape> = {
		w: T.number,
		h: T.number,
	};

	// [3]
	override isAspectRatioLocked = (_shape: IMyshape) => true;
	override canResize = (_shape: IMyshape) => false;
	override canBind = (_shape: IMyshape) => true;

	// [4]
	override canEdit = () => false;

	// [5]
	getDefaultProps(): IMyshape["props"] {
		return {
			w: 170,
			h: 165,
		};
	}

	// [6]
	getGeometry(shape: IMyshape) {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		});
	}

	// [7]
	component(shape: IMyshape) {
		return (
			<HTMLContainer id={shape.id}>
				<div
					style={{
						pointerEvents: "all",
					}}
				>
					<Button>hello</Button>
					<Textarea />
				</div>
			</HTMLContainer>
		);
	}

	// [8]
	indicator(shape: IMyshape) {
		const isEditing = useIsEditing(shape.id);
		return (
			<rect
				stroke={isEditing ? "red" : "blue"}
				width={shape.props.w}
				height={shape.props.h}
			/>
		);
	}

	// [9]
	override onResize: TLOnResizeHandler<IMyshape> = (shape, info) => {
		return resizeBox(shape, info);
	};

	// [10]
	override onEditEnd: TLOnEditEndHandler<IMyshape> = (shape) => {
		const frame1 = structuredClone(shape);
		const frame2 = structuredClone(shape);

		frame1.x = shape.x + 1.2;
		frame2.x = shape.x - 1.2;

		this.editor.animateShape(frame1, { duration: 50 });

		setTimeout(() => {
			this.editor.animateShape(frame2, { duration: 50 });
		}, 100);

		setTimeout(() => {
			this.editor.animateShape(shape, { duration: 100 });
		}, 200);
	};
}

function CustomZoomMenu() {
	return (
		<DefaultZoomMenu>
			<TldrawUiMenuGroup id="example">
				<TldrawUiMenuItem
					id="like"
					label="Like my posts"
					icon="external-link"
					readonlyOk
					onSelect={() => {
						window.open("https://x.com/tldraw", "_blank");
					}}
				/>
			</TldrawUiMenuGroup>
			<DefaultZoomMenuContent />
		</DefaultZoomMenu>
	);
}

const customShapeUtils = [MyshapeUtil];
const customTools = [MyshapeTool];

function App() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="halogen-theme">
			<div
				className="tldraw__editor"
				style={{
					position: "absolute",
					inset: 0,
				}}
			>
				<Tldraw
					inferDarkMode
					initialState="hand"
					persistenceKey="example"
					// Pass in a function that will be called when the editor is mounte
					onMount={(e) => {
						e.updateInstanceState({
							isGridMode: true,
						});

						e.on;
					}}
					// Pass in the array of custom shape classes
					shapeUtils={customShapeUtils}
					// Pass in the array of custom tools
					tools={customTools}
					// Pass in any overrides to the user interface
					overrides={uiOverrides}
					// pass in the new Keyboard Shortcuts component
					components={components}
				/>
			</div>
		</ThemeProvider>
	);
}

export default App;
