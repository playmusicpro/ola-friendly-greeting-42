import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Search, 
  Music, 
  DollarSign, 
  FileText, 
  Calendar,
  Lightbulb,
  MessageCircle
} from "lucide-react";
import { faqItems, tooltips } from "@/lib/helpContent";

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpCenter = ({ isOpen, onClose }: HelpCenterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("faq");

  const filteredFaq = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tipCategories = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Calendar,
      tips: Object.entries(tooltips.dashboard).map(([key, value]) => ({
        key,
        text: value,
      })),
    },
    {
      id: "repertoire",
      label: "Repertório",
      icon: Music,
      tips: Object.entries(tooltips.repertoire).map(([key, value]) => ({
        key,
        text: value,
      })),
    },
    {
      id: "financial",
      label: "Finanças",
      icon: DollarSign,
      tips: Object.entries(tooltips.financial).map(([key, value]) => ({
        key,
        text: value,
      })),
    },
    {
      id: "export",
      label: "Exportação",
      icon: FileText,
      tips: Object.entries(tooltips.export).map(([key, value]) => ({
        key,
        text: value,
      })),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] p-0 gap-0 bg-card border-gold/20 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Central de Ajuda
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ajuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent p-0">
            <TabsTrigger
              value="faq"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Perguntas
            </TabsTrigger>
            <TabsTrigger
              value="tips"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Dicas Rápidas
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[50vh] p-4">
            <TabsContent value="faq" className="mt-0 space-y-2">
              {filteredFaq.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFaq.map((item) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      className="border border-border/50 rounded-lg px-4 data-[state=open]:bg-secondary/30"
                    >
                      <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-line">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum resultado encontrado</p>
                  <p className="text-xs">Tente buscar por outros termos</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tips" className="mt-0 space-y-4">
              {tipCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <category.icon className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">{category.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {category.tips.length} dicas
                    </Badge>
                  </div>
                  <div className="space-y-2 pl-6">
                    {category.tips.map((tip) => (
                      <div
                        key={tip.key}
                        className="p-3 rounded-lg bg-secondary/30 border border-border/50"
                      >
                        <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                          {tip.key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm">{tip.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-secondary/20">
          <div className="text-center text-xs text-muted-foreground">
            <p>Não encontrou o que procurava?</p>
            <Button variant="link" className="text-primary text-xs p-0 h-auto">
              Entre em contato com o suporte
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpCenter;
