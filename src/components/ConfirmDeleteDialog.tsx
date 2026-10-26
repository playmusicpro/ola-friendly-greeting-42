import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

interface Props {
  open: boolean;
  itemName?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Modal único de confirmação para toda exclusão do app. */
const ConfirmDeleteDialog = ({ open, itemName, description, onCancel, onConfirm }: Props) => (
  <AlertDialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="break-words">
          Tem certeza que deseja excluir {itemName ? `"${itemName}"` : "este item"}?
        </AlertDialogTitle>
        <AlertDialogDescription>
          {description ?? "Esta ação não pode ser desfeita."}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={onConfirm}>
          Confirmar Exclusão
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ConfirmDeleteDialog;
