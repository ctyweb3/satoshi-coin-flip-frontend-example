import { useContext, useState } from "react";
import { useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  Box,
  Container,
  Heading,
  TextFieldInput,
  Text,
  Button,
  Flex,
} from "@radix-ui/themes";
import { toast } from "react-toastify";
import { MIST_PER_SUI } from "@mysten/sui.js/utils";

import { PACKAGE_ID } from "../../constants";
import { SuiTransactionBlockResponse } from "@mysten/sui.js/client";
import { useFetchCounterNft } from "./useFetchCounterNft";
import { HouseDataContext } from "../House/HouseDataContext";
import { CoinAnimation } from "../../components/CoinAnimation";

export function PlayerCreateGame() {
  const { mutate: execCreateGame, isLoading } =
    useSignAndExecuteTransactionBlock();
  const { data: counterNFTData } = useFetchCounterNft();

  const [guess, setGuess] = useState("");
  const [stake, setStake] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const [houseDataId] = useContext(HouseDataContext);

  // 处理硬币翻转结束
  const handleFlipEnd = (result: string) => {
    setIsFlipping(false);

    // 如果有猜测结果，可以展示胜负
    if (guess) {
      const isWin = result === guess;
      toast.info(`${isWin ? '猜对了！' : '猜错了！'} 结果是: ${result === 'H' ? '正面' : '反面'}`);
    }
  };

  // 提交表单创建游戏
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 开始硬币翻转动画
    setIsFlipping(true);

    // 等待动画完成后再创建游戏
    setTimeout(() => {
      // 创建交易
      const txb = new TransactionBlock();

      // 玩家下注
      const [stakeCoin] = txb.splitCoins(txb.gas, [
        MIST_PER_SUI * BigInt(stake),
      ]);

      // 创建游戏
      txb.moveCall({
        target: `${PACKAGE_ID}::single_player_satoshi::start_game`,
        arguments: [
          txb.pure.string(guess),
          txb.object(counterNFTData[0].data?.objectId!),
          stakeCoin,
          txb.object(houseDataId),
        ],
      });

      execCreateGame(
        {
          transactionBlock: txb,
        },
        {
          onError: (err) => {
            toast.error(err.message);
          },
          onSuccess: (result: SuiTransactionBlockResponse) => {
            toast.success(`Digest: ${result.digest}`);
          },
        }
      );
    }, 2100);  // 比动画时间稍长一点，确保动画完成
  };

  return (
    <Container mb={"4"}>
      <Heading size="3" mb="2">
        Create Game
      </Heading>

      {/* 硬币动画组件 */}
      <Flex direction="column" align="center" justify="center" mb="4">
        <CoinAnimation
          guess={guess}
          isFlipping={isFlipping}
          onFlipEnd={handleFlipEnd}
        />
      </Flex>

      <form onSubmit={handleSubmit}>
        <Box mb="3">
          <Text>Guess</Text>
          <TextFieldInput
            required
            placeholder="Guess (H or T)"
            onChange={(e) => {
              setGuess(e.target.value.toUpperCase());
            }}
            value={guess}
          />
        </Box>

        <Box mb="3">
          <Text>Stake</Text>
          <TextFieldInput
            required
            placeholder="Stake (in SUI)"
            onChange={(e) => {
              setStake(Number(e.target.value));
            }}
            type="number"
            step="0.01"
            min="0"
          />
        </Box>

        <Button
          disabled={isLoading || counterNFTData?.length <= 0 || isFlipping}
          type="submit"
        >
          {isFlipping ? "硬币翻转中..." : "Create Game"}
        </Button>
      </form>
    </Container>
  );
}
